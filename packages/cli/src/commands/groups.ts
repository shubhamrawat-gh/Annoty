import pc from 'picocolors';
import { readCredentials } from '../lib/credentials.js';

export async function groupsCommand() {
  const credentials = readCredentials();
  if (!credentials || !credentials.token) {
    console.log(pc.red('\n✗ Error: You must be logged in to list groups.'));
    console.log(pc.yellow("Please run 'annoty login' first.\n"));
    process.exit(1);
  }

  const apiUrl = credentials.apiUrl || process.env.ANNOTY_API_URL || 'http://localhost:5000';
  console.log(pc.cyan('\nFetching your annotation groups...'));

  try {
    const response = await fetch(`${apiUrl}/api/groups`, {
      headers: {
        'Authorization': `Bearer ${credentials.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    const groups: any[] = await response.json();
    console.log(pc.bold('\n📂 Synced Groups:\n'));

    if (groups.length === 0) {
      console.log('  No groups found. Create one in the dashboard.');
    } else {
      groups.forEach((g) => {
        console.log(`  - ${pc.bold(pc.green(g.name))} (ID: ${pc.dim(g.id)})`);
      });
    }
    console.log();
  } catch (err: any) {
    console.log(pc.red(`\n✗ Failed to retrieve groups: ${err.message}\n`));
  }
}

