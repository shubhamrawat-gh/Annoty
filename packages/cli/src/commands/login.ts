import pc from 'picocolors';
import open from 'open';
import prompts from 'prompts';
import { readCredentials, writeCredentials } from '../lib/credentials.js';
import { startCallbackServer } from '../lib/localCallbackServer.js';

export async function loginCommand(options?: { dashboard?: string }) {
  // Check if already logged in
  const existing = readCredentials();
  if (existing) {
    console.log(pc.yellow(`You are already logged in as ${existing.email} (saved at ${existing.savedAt}).`));
    const confirm = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: 'Do you want to log in again and overwrite these credentials?',
      initial: false,
    });

    if (!confirm.overwrite) {
      console.log(pc.blue('Login cancelled. Keeping existing credentials.'));
      return;
    }
  }

  const dashboardUrl = options?.dashboard || process.env.ANNOTY_DASHBOARD_URL || 'https://annoty-dash.web.app';
  console.log(pc.blue('Starting authentication process...'));

  // Start local server
  const serverInstance = startCallbackServer(9876, 120000); // 2 minutes timeout

  try {
    const port = await serverInstance.portPromise;
    const redirectUri = `http://localhost:${port}/callback`;
    const authUrl = `${dashboardUrl}/login?cli_redirect=${encodeURIComponent(redirectUri)}`;

    console.log(pc.cyan(`Opening your browser to authenticate...`));
    console.log(pc.dim(`If it does not open automatically, visit this URL:\n${authUrl}\n`));

    // Open browser
    await open(authUrl);

    console.log(pc.yellow('Waiting for browser authentication to complete... (Timeout in 2 minutes)'));

    const result = await serverInstance.authPromise;

    // Derive backend API URL from dashboard URL or environment variable
    let apiUrl = process.env.ANNOTY_API_URL || '';
    if (!apiUrl) {
      if (dashboardUrl.includes('localhost:3000') || dashboardUrl.includes('localhost:5173')) {
        apiUrl = 'http://localhost:5000';
      } else if (dashboardUrl.includes('annoty-dash.web.app')) {
        apiUrl = 'https://annoty-api.web.app';
      } else {
        apiUrl = dashboardUrl;
      }
    }

    // Save credentials
    const credentials = {
      token: result.token,
      email: result.email,
      apiUrl,
      savedAt: new Date().toISOString(),
    };
    writeCredentials(credentials);

    console.log(pc.green(`\n✓ Logged in as ${result.email}`));
  } catch (error: any) {
    serverInstance.cancel();
    console.error(pc.red(`\n✗ Authentication failed: ${error.message}`));
    process.exit(1);
  }
}

