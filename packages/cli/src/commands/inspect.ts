import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import { spawn } from 'child_process';

export async function inspectCommand() {
  console.log(pc.bold('\n🔍 Annoty Inspect — Starting Instrumented Inspection Session\n'));
  console.log(pc.cyan('ℹ This mode runs your project with Annoty build-time plugins dynamically enabled.'));
  console.log(pc.cyan('ℹ No changes will be made to your actual deployed codebase.\n'));

  const cwd = process.cwd();
  let originalConfigName = '';
  let isTS = false;

  if (fs.existsSync(path.join(cwd, 'vite.config.ts'))) {
    originalConfigName = 'vite.config.ts';
    isTS = true;
  } else if (fs.existsSync(path.join(cwd, 'vite.config.js'))) {
    originalConfigName = 'vite.config.js';
  } else if (fs.existsSync(path.join(cwd, 'vite.config.mjs'))) {
    originalConfigName = 'vite.config.mjs';
  } else if (fs.existsSync(path.join(cwd, 'vite.config.cjs'))) {
    originalConfigName = 'vite.config.cjs';
  }

  const tempConfigName = isTS ? 'vite.config.annoty.tmp.ts' : 'vite.config.annoty.tmp.js';
  const tempConfigPath = path.join(cwd, tempConfigName);

  let tempConfigContent = '';

  if (originalConfigName) {
    console.log(`Wrapping existing Vite configuration: ${pc.green(originalConfigName)}`);
    tempConfigContent = `import { defineConfig } from 'vite';
import { annoty } from '@annoty/build-plugins';
import originalConfig from './${originalConfigName}';

export default defineConfig(async (env) => {
  let resolvedConfig = originalConfig;
  if (resolvedConfig && (resolvedConfig as any).default) {
    resolvedConfig = (resolvedConfig as any).default;
  }
  if (typeof resolvedConfig === 'function') {
    resolvedConfig = await resolvedConfig(env);
  } else if (resolvedConfig && typeof (resolvedConfig as any).then === 'function') {
    resolvedConfig = await resolvedConfig;
  }
  
  if (resolvedConfig && (resolvedConfig as any).default) {
    resolvedConfig = (resolvedConfig as any).default;
  }
  
  const config = { ...resolvedConfig };
  config.plugins = [
    ...(config.plugins || []),
    ...annoty({ enabled: true })
  ];
  console.log('RESOLVED VITE PLUGINS:', config.plugins.map(p => p && (p as any).name).filter(Boolean));
  return config;
});
`;
  } else {
    console.log(pc.yellow('No existing vite.config found. Creating a default wrapper with Annoty plugins.'));
    tempConfigContent = `import { defineConfig } from 'vite';
import { annoty } from '@annoty/build-plugins';

export default defineConfig({
  plugins: [
    ...annoty({ enabled: true })
  ]
});
`;
  }

  // Write temporary config file
  try {
    fs.writeFileSync(tempConfigPath, tempConfigContent, 'utf8');
    console.log(`Temporary configuration written to: ${pc.cyan(tempConfigName)}`);
  } catch (err: any) {
    console.error(pc.red(`✗ Error: Failed to write temporary config: ${err.message}`));
    process.exit(1);
  }

  // Cleanup helper
  const cleanup = () => {
    if (fs.existsSync(tempConfigPath)) {
      try {
        fs.unlinkSync(tempConfigPath);
        console.log(pc.dim(`\nCleanup: Removed temporary config ${tempConfigName}`));
      } catch (err: any) {
        console.error(pc.red(`\nCleanup Error: Failed to remove temporary config: ${err.message}`));
      }
    }
  };

  // Listen to process terminations for cleanup
  process.on('SIGINT', () => {
    cleanup();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    cleanup();
    process.exit(0);
  });
  process.on('exit', () => {
    cleanup();
  });

  // Build the arguments to pass to the vite runner
  // Forward process.argv starting from index 3 (after 'inspect')
  const userArgs = process.argv.slice(3);
  const spawnArgs = ['vite', '--config', tempConfigName, ...userArgs];

  console.log(pc.blue(`Spawning Vite: npx ${spawnArgs.join(' ')}\n`));

  const child = spawn('npx', spawnArgs, {
    cwd,
    stdio: 'inherit',
    shell: true,
  });

  child.on('close', (code) => {
    cleanup();
    process.exit(code ?? 0);
  });

  child.on('error', (err) => {
    console.error(pc.red(`✗ Execution Error: ${err.message}`));
    cleanup();
    process.exit(1);
  });
}
