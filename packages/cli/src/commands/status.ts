import pc from 'picocolors';
import fs from 'fs';
import path from 'path';

export async function statusCommand() {
  console.log(pc.bold('\n✏️  Annoty System Status — 100% On-Device Mode\n'));

  console.log(`  Storage Mode:    ${pc.green('IndexedDB (Zero-Cloud, On-Device)')}`);
  console.log(`  Network Calls:   ${pc.green('0 (Fully Offline Compatible)')}`);

  // Scan current project status
  const cwd = process.cwd();
  const possiblePaths = [
    path.join(cwd, 'index.html'),
    path.join(cwd, 'public', 'index.html'),
    path.join(cwd, 'src', 'index.html'),
    path.join(cwd, 'demo-site', 'index.html'),
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
    const hasTag = content.includes('overlay.js') || content.includes('data-annoty-mode');
    const localOverlay =
      fs.existsSync(path.join(cwd, 'public', 'overlay.js')) ||
      fs.existsSync(path.join(path.dirname(detectedPath), 'overlay.js')) ||
      fs.existsSync(path.join(cwd, 'overlay.js'));

    console.log(`  Project Entry:   ${pc.blue(path.relative(cwd, detectedPath))}`);
    console.log(`  Script Status:   ${hasTag ? pc.green('Active in HTML') : pc.yellow('Not Injected')}`);
    console.log(`  Local Bundle:    ${localOverlay ? pc.green('Copied locally') : pc.dim('Not found (run "annoty init")')}`);
  } else {
    console.log(`  Project Entry:   ${pc.dim('No HTML entry point detected in current directory.')}`);
  }

  const configPath = path.join(cwd, 'annoty.config.json');
  console.log(`  Config File:     ${fs.existsSync(configPath) ? pc.green('Custom (annoty.config.json)') : pc.dim('Built-in Defaults')}`);
  console.log();
}
