import pc from 'picocolors';
import net from 'net';
import { readCredentials } from '../lib/credentials.js';

export async function doctorCommand() {
  console.log(pc.bold('\n🩺 Annoty Doctor — Environmental Diagnostics\n'));

  // 1. Check Node version
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.slice(1).split('.')[0], 10);
  if (major >= 18) {
    console.log(`  ${pc.green('✓')} Node.js version:   ${pc.cyan(nodeVersion)} (Matches requirement >= v18)`);
  } else {
    console.log(`  ${pc.red('✗')} Node.js version:   ${pc.red(nodeVersion)} (Upgrade required, >= v18)`);
  }

  // 2. Check Credentials
  const credentials = readCredentials();
  if (credentials) {
    console.log(`  ${pc.green('✓')} Credentials status: ${pc.green('Valid')} (Logged in as ${credentials.email})`);
  } else {
    console.log(`  ${pc.yellow('⚠')} Credentials status: ${pc.yellow('No active credentials. Please run login first.')}`);
  }

  // 3. Test Port 9876
  const testPort = (port: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.once('error', () => resolve(false));
      server.once('listening', () => {
        server.close();
        resolve(true);
      });
      server.listen(port);
    });
  };

  const portFree = await testPort(9876);
  if (portFree) {
    console.log(`  ${pc.green('✓')} OAuth Loopback port: ${pc.green('Port 9876 is free and available')}`);
  } else {
    console.log(`  ${pc.yellow('⚠')} OAuth Loopback port: ${pc.yellow('Port 9876 is occupied. CLI will automatically sequence.')}`);
  }

  // 4. Check if @annoty/overlay is present in dependencies or node_modules
  const cwd = process.cwd();
  let resolvesCorrectly = false;
  try {
    const fs = await import('fs');
    const path = await import('path');
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

  if (resolvesCorrectly) {
    console.log(`  ${pc.green('✓')} Overlay resolution: @annoty/overlay resolves correctly in current directory`);
  } else {
    console.log(`  ${pc.yellow('⚠')} Overlay resolution: @annoty/overlay is not installed or linked in this project directory`);
  }

  console.log(pc.dim('\nDiagnostics complete. All checks finished.\n'));
}

