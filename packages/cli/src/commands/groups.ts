import pc from 'picocolors';
import { readCredentials } from '../lib/credentials.js';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10cnhxenZwbHlteGV3bnBhb3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1ODE1NDUsImV4cCI6MjA5ODE1NzU0NX0.Lkn3cMlQwaMMK7TjQ_fKvkYTianpGc5RgQPnalNGTFo';
const SUPABASE_URL = 'https://mtrxqzvplymxewnpaorf.supabase.co';

export async function groupsCommand() {
  const credentials = readCredentials();
  if (!credentials || !credentials.token) {
    console.log(pc.red('\n✗ Error: You must be logged in to list groups.'));
    console.log(pc.yellow("Please run 'annoty login' first.\n"));
    process.exit(1);
  }

  console.log(pc.cyan('\nFetching your annotation groups...'));

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/groups?select=id,name,created_at`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
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
