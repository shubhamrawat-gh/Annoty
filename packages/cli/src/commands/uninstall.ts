import fs from 'fs';
import path from 'path';
import os from 'os';
import pc from 'picocolors';
import prompts from 'prompts';

export async function uninstallCommand() {
  console.log(pc.bold('\n⚠️  Annoty Uninstaller\n'));

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
