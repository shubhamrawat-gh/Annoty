import fs from 'fs';
import path from 'path';
import os from 'os';
import pc from 'picocolors';
import prompts from 'prompts';

export async function uninstallCommand() {
  console.log(pc.bold('\n⚠️  Annoty Uninstaller\n'));

  // 1. Workspace Cleanup Scan
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
    const hasScriptTag = content.includes('data-annoty-token') || content.includes('overlay.js');
    const publicOverlay = path.join(cwd, 'public', 'overlay.js');
    const localOverlay = path.join(path.dirname(detectedPath), 'overlay.js');
    const hasLocalScript = fs.existsSync(publicOverlay) || fs.existsSync(localOverlay);

    if (hasScriptTag || hasLocalScript) {
      console.log(pc.cyan('Found active Annoty injection in this project directory:'));
      if (hasScriptTag) console.log(`  - Script tag in ${pc.blue(path.relative(cwd, detectedPath))}`);
      if (fs.existsSync(publicOverlay)) console.log(`  - Local copy at ${pc.blue(path.relative(cwd, publicOverlay))}`);
      if (fs.existsSync(localOverlay)) console.log(`  - Local copy at ${pc.blue(path.relative(cwd, localOverlay))}`);
      console.log();

      const confirmClean = await prompts({
        type: 'confirm',
        name: 'proceed',
        message: 'Do you want to clean up Annoty from this project workspace first?',
        initial: true,
      });

      if (confirmClean.proceed) {
        const regex = /<script\b[^>]*data-annoty-token="[^"]*"[^>]*><\/script>|<script\b[^>]*src="[^"]*overlay\.js"[^>]*><\/script>/gi;
        const cleanedContent = content.replace(regex, '');
        try {
          fs.writeFileSync(detectedPath, cleanedContent, 'utf8');
          console.log(pc.green(`✓ Removed Annoty script tag from ${pc.blue(path.relative(cwd, detectedPath))}`));

          if (fs.existsSync(publicOverlay)) {
            fs.unlinkSync(publicOverlay);
            console.log(pc.green(`✓ Deleted ${pc.blue(path.relative(cwd, publicOverlay))}`));
          }
          if (fs.existsSync(localOverlay)) {
            fs.unlinkSync(localOverlay);
            console.log(pc.green(`✓ Deleted ${pc.blue(path.relative(cwd, localOverlay))}`));
          }
          console.log(pc.green('✓ Workspace cleaned successfully.\n'));
        } catch (err: any) {
          console.log(pc.yellow(`⚠️ Warning: Failed to clean project workspace: ${err.message}`));
        }
      }
    }
  }

  // 2. Global Configurations Cleanup
  const confirmUninstall = await prompts({
    type: 'confirm',
    name: 'proceed',
    message: 'Are you sure you want to remove all Annoty configurations and login data from this computer?',
    initial: false,
  });

  if (!confirmUninstall.proceed) {
    console.log(pc.yellow('Uninstall cancelled.'));
    return;
  }

  const credentialsDir = path.join(os.homedir(), '.annoty');

  try {
    if (fs.existsSync(credentialsDir)) {
      fs.rmSync(credentialsDir, { recursive: true, force: true });
      console.log(pc.green(`✓ Deleted local configuration folder at ${pc.blue(credentialsDir)}`));
    } else {
      console.log(pc.dim('  No local configuration folder found.'));
    }

    console.log(pc.bold(pc.green('\n✓ Annoty configurations successfully cleared!')));
    console.log(pc.cyan('\nTo complete the removal, run this command in your terminal:'));
    console.log(pc.bold(pc.white('  npm uninstall -g annoty\n')));
  } catch (err: any) {
    console.log(pc.red(`\n✗ Error during uninstall: ${err.message}\n`));
    process.exit(1);
  }
}
