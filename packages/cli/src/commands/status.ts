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
    const hasTag = content.includes('data-annoty-token');
    const localOverlay = fs.existsSync(path.join(cwd, 'public', 'overlay.js')) || fs.existsSync(path.join(path.dirname(detectedPath), 'overlay.js'));

    console.log(`  Project path: ${pc.blue(path.relative(cwd, detectedPath))}`);
    console.log(`  Script tag:   ${hasTag ? pc.green('Injected') : pc.yellow('Not Injected')}`);
    console.log(`  Local Assets: ${localOverlay ? pc.green('overlay.js copied') : pc.dim('None')}`);
  } else {
    console.log(`  Project:      ${pc.dim('No HTML entry point detected in current directory.')}`);
  }
  console.log();
}
