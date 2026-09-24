import pc from 'picocolors';
import fs from 'fs';
import path from 'path';

export async function doctorCommand() {
  console.log(pc.bold('\n🩺 Annoty Doctor — Environmental Diagnostics\n'));

  const cwd = process.cwd();

  // 1. Check Node version
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.slice(1).split('.')[0], 10);
  if (major >= 18) {
    console.log(`  ${pc.green('✓')} Node.js version:      ${pc.cyan(nodeVersion)} (Matches requirement >= v18)`);
  } else {
    console.log(`  ${pc.red('✗')} Node.js version:      ${pc.red(nodeVersion)} (Upgrade required, >= v18)`);
  }

  // 2. Framework detection
  const pkgPath = path.join(cwd, 'package.json');
  let framework = 'Static HTML / Unknown';
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      if (deps['next']) framework = 'Next.js';
      else if (deps['vite']) framework = 'Vite';
      else if (deps['react']) framework = 'React';
      else if (deps['vue']) framework = 'Vue';
      else if (deps['svelte']) framework = 'Svelte';
      else if (deps['astro']) framework = 'Astro';
      else if (deps['nuxt']) framework = 'Nuxt';
      console.log(`  ${pc.green('✓')} Framework detected:   ${pc.cyan(framework)}`);
    } catch {}
  } else {
    console.log(`  ${pc.dim('ℹ')} Framework:           ${pc.dim(framework)}`);
  }

  // 3. Annoty Local Assets
  const publicOverlay = path.join(cwd, 'public', 'overlay.js');
  const rootOverlay = path.join(cwd, 'overlay.js');
  const hasOverlay = fs.existsSync(publicOverlay) || fs.existsSync(rootOverlay);
  if (hasOverlay) {
    console.log(`  ${pc.green('✓')} Overlay asset:        ${pc.green('Present on local disk')}`);
  } else {
    console.log(`  ${pc.yellow('ℹ')} Overlay asset:        ${pc.yellow('Not copied locally (run "annoty init")')}`);
  }

  // 4. Configuration check
  const configPath = path.join(cwd, 'annoty.config.json');
  if (fs.existsSync(configPath)) {
    console.log(`  ${pc.green('✓')} Project config:       ${pc.green('annoty.config.json detected')}`);
  } else {
    console.log(`  ${pc.dim('ℹ')} Project config:       ${pc.dim('Default built-in configuration active')}`);
  }

  // 5. Injection Check
  const possibleHtml = [
    path.join(cwd, 'index.html'),
    path.join(cwd, 'public', 'index.html'),
    path.join(cwd, 'src', 'index.html'),
  ];
  let isInjected = false;
  for (const p of possibleHtml) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      if (content.includes('overlay.js') || content.includes('data-annoty-mode')) {
        isInjected = true;
        break;
      }
    }
  }

  if (isInjected) {
    console.log(`  ${pc.green('✓')} Script integration:   ${pc.green('Active in HTML template')}`);
  } else {
    console.log(`  ${pc.yellow('ℹ')} Script integration:   ${pc.yellow('Not injected into HTML (run "annoty init" or use import "annoty")')}`);
  }

  console.log(pc.bold(pc.green('\n✓ Environment diagnostics complete.\n')));
}
