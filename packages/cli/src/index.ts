#!/usr/bin/env node

import { Command } from 'commander';
import { loginCommand } from './commands/login.js';
import { logoutCommand } from './commands/logout.js';
import { initCommand } from './commands/init.js';
import { statusCommand } from './commands/status.js';
import { cleanCommand } from './commands/clean.js';
import { doctorCommand } from './commands/doctor.js';
import { groupsCommand } from './commands/groups.js';
import { uninstallCommand } from './commands/uninstall.js';
import { updateCommand } from './commands/update.js';
import { inspectCommand } from './commands/inspect.js';

const program = new Command();

program
  .name('annoty')
  .description('CLI tool for Annoty — Auth, Diagnostics, and Cleanups')
  .version('1.0.4');

program
  .command('login')
  .description('Log in to Annoty via browser authentication')
  .option('-d, --dashboard <url>', 'Specify custom dashboard URL')
  .action(loginCommand);

program
  .command('logout')
  .description('Log out of Annoty and clear local credentials')
  .action(logoutCommand);

program
  .command('init')
  .description('Initialize Annoty in a project by injecting script tag and overlay')
  .action(initCommand);

program
  .command('status')
  .description('Show Annoty authentication status and project configuration')
  .action(statusCommand);

program
  .command('clean')
  .description('Remove Annoty script tags and local overlay files from the project')
  .action(cleanCommand);

program
  .command('doctor')
  .description('Perform environment diagnostics and setup checks')
  .action(doctorCommand);

program
  .command('groups')
  .description('List your synced annotation groups')
  .action(groupsCommand);

program
  .command('uninstall')
  .description('Completely clear all Annoty configurations from your computer')
  .action(uninstallCommand);

program
  .command('update')
  .description('Update the Annoty CLI to the latest version')
  .action(updateCommand);

program
  .command('inspect')
  .allowUnknownOption()
  .description('Start an instrumented inspection session using Vite with Annoty plugins enabled')
  .action(inspectCommand);

program.parse(process.argv);
