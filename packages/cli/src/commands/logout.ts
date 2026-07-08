import pc from 'picocolors';
import { deleteCredentials, readCredentials } from '../lib/credentials.js';

export async function logoutCommand() {
  try {
    const existing = readCredentials();
    if (!existing) {
      console.log(pc.yellow('You are not logged in.'));
      return;
    }
    deleteCredentials();
    console.log(pc.green('✓ Successfully logged out. Credentials removed.'));
  } catch (error: any) {
    console.error(pc.red(`\n✗ Logout failed: ${error.message}`));
    process.exit(1);
  }
}
