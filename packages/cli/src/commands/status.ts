import pc from 'picocolors';
import fs from 'fs';
import path from 'path';
import { readCredentials } from '../lib/credentials.js';

export async function statusCommand() {
  const credentials = readCredentials();
  console.log(pc.bold('\n✏️  Annoty System Status\n'));

  if (!credentials) {
    console.log(`  Status:       ${pc.red('Logged Out')}`);
    console.log(`  Active User:  ${pc.dim('None')}`);
  } else {
    console.log(`  Status:       ${pc.green('Logged In')}`);
    console.log(`  Active User:  ${pc.cyan(credentials.email)}`);
    console.log(`  Session Age:  ${pc.dim(new Date(credentials.savedAt).toLocaleString())}`);
  }

  // Scan current project status
  const cwd = process.cwd();
  const possiblePaths = [
    path.join(cwd, 'index.html'),
    path.join(cwd, 'public', 'index.html'),
    path.join(cwd, 'src', 'index.html'),
  ];

  let detectedPath: string | null = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      detectedPath = p;
      break;
    }
  }

  if (detectedPath) {
    const content = fs.readFileSync(detectedPath, 'utf8');
    const annotyScriptRegex = /<script\s+[^>]*src=["'][^"']*overlay\.js["'][^>]*><\/script>/gi;
    const hasTag = annotyScriptRegex.test(content);
    
    let activeMode = pc.dim('N/A');
    if (hasTag) {
      activeMode = content.includes('data-annoty-token=') ? pc.green('Cloud-Sync Mode') : pc.yellow('Local-Only (Offline) Mode');
    }

    const localOverlay = fs.existsSync(path.join(cwd, 'public', 'overlay.js')) || fs.existsSync(path.join(path.dirname(detectedPath), 'overlay.js'));

    // Check node_modules resolution
    let resolvesCorrectly = false;
    try {
      const pkgPath = path.join(cwd, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const hasDep = (pkg.dependencies && pkg.dependencies['@annoty/overlay']) ||
                       (pkg.devDependencies && pkg.devDependencies['@annoty/overlay']);
        if (hasDep) resolvesCorrectly = true;
      }
      if (fs.existsSync(path.join(cwd, 'node_modules', '@annoty', 'overlay'))) {
        resolvesCorrectly = true;
      }
    } catch (e) {
      // Ignore
    }

    console.log(`  Project path: ${pc.blue(path.relative(cwd, detectedPath))}`);
    console.log(`  Script tag:   ${hasTag ? pc.green('Injected') : pc.yellow('Not Injected')}`);
    if (hasTag) {
      console.log(`  Active Mode:  ${activeMode}`);
    }
    console.log(`  Local Assets: ${localOverlay ? pc.green('overlay.js copied') : pc.dim('None')}`);
    console.log(`  Overlay Dep:  ${resolvesCorrectly ? pc.green('Resolves correctly in project') : pc.yellow('Missing in node_modules/dependencies')}`);
  } else {
    console.log(`  Project:      ${pc.dim('No HTML entry point detected in current directory.')}`);
  }
  console.log();
}

