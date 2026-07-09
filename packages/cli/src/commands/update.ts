import { execSync } from 'child_process';
import pc from 'picocolors';
import prompts from 'prompts';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function updateCommand() {
  console.log(pc.bold('\n🔄 Checking for Annoty CLI updates...\n'));

  try {
    // 1. Fetch latest version from npm registry
    const response = await fetch('https://registry.npmjs.org/annoty/latest');
    if (!response.ok) {
      throw new Error('Failed to reach npm registry');
    }
    const data: any = await response.json();
    const latestVersion = data.version;

    // 2. Read local package.json version
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    let localVersion = '1.0.3';
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      localVersion = packageJson.version;
    }

    console.log(`  Current version: ${pc.cyan(localVersion)}`);
    console.log(`  Latest version:  ${pc.cyan(latestVersion)}\n`);

    if (localVersion === latestVersion) {
      console.log(pc.green('✓ You are already running the latest version!\n'));
      return;
    }

    console.log(pc.yellow(`🔔 A new version (${latestVersion}) is available!`));

    const confirmUpdate = await prompts({
      type: 'confirm',
      name: 'proceed',
      message: 'Would you like to install the latest version globally?',
      initial: true,
    });

    if (!confirmUpdate.proceed) {
      console.log(pc.yellow('\nUpdate cancelled.'));
      console.log(`To run the latest version on the fly, use: ${pc.bold('npx annoty@latest <command>')}\n`);
      return;
    }

    console.log(pc.cyan('\nUpdating annoty to the latest version...'));
    execSync('npm install -g annoty@latest', { stdio: 'inherit' });
    console.log(pc.bold(pc.green('\n✓ Update complete! Please check the version using: annoty --version\n')));

  } catch (err: any) {
    console.log(pc.red(`\n✗ Error checking for updates: ${err.message}`));
    console.log(`You can update manually using: ${pc.bold('npm install -g annoty@latest')}\n`);
  }
}
