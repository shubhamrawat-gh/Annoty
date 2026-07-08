import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import prompts from 'prompts';
import { fileURLToPath } from 'url';
import { readCredentials } from '../lib/credentials.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initCommand() {
  const credentials = readCredentials();
  const isCloudMode = !!(credentials && credentials.token);

  if (!isCloudMode) {
    console.log(pc.yellow('\nℹ Note: No active credentials found.'));
    console.log(`Running in ${pc.bold('Local-Only (Offline) Mode')}. Annotations will be saved to browser LocalStorage.\n`);
  } else {
    console.log(pc.green(`\n✓ Active credentials found. Running in ${pc.bold('Cloud-Sync Mode')} for ${pc.cyan(credentials!.email)}.\n`));
  }

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

  let targetPath: string | null = null;

  if (detectedPath) {
    const relativePath = path.relative(cwd, detectedPath);
    const confirmUse = await prompts({
      type: 'confirm',
      name: 'useDetected',
      message: `Detected HTML file at ${pc.cyan(relativePath)}. Use this file?`,
      initial: true,
    });

    if (confirmUse.useDetected) {
      targetPath = detectedPath;
    }
  }

  if (!targetPath) {
    const manualPathPrompt = await prompts({
      type: 'text',
      name: 'filePath',
      message: 'Enter the path to your HTML file (e.g., index.html or public/index.html):',
      validate: (value) => (value.trim().length > 0 ? true : 'Please enter a path'),
    });

    if (!manualPathPrompt.filePath) {
      console.log(pc.yellow('Initialization cancelled.'));
      return;
    }

    const resolvedManualPath = path.resolve(cwd, manualPathPrompt.filePath);
    if (!fs.existsSync(resolvedManualPath)) {
      console.log(pc.red(`\n✗ Error: The file at "${resolvedManualPath}" does not exist.`));
      console.log(pc.yellow('Make sure you are running the command in the correct project directory.\n'));
      process.exit(1);
    }

    targetPath = resolvedManualPath;
  }

  // Read the file content
  let content = '';
  try {
    content = fs.readFileSync(targetPath, 'utf8');
  } catch (err: any) {
    console.log(pc.red(`\n✗ Error: Failed to read file: ${err.message}`));
    process.exit(1);
  }

  // Determine overlay URL and copy destination
  const sourceOverlayPath = path.resolve(__dirname, '..', 'overlay.js');
  let finalOverlayUrl = 'https://cdn.annoty.com/overlay.js';
  let overlayDestPath = '';

  if (fs.existsSync(sourceOverlayPath)) {
    const publicDir = path.join(cwd, 'public');
    if (fs.existsSync(publicDir)) {
      overlayDestPath = path.join(publicDir, 'overlay.js');
      finalOverlayUrl = '/overlay.js';
    } else {
      overlayDestPath = path.join(path.dirname(targetPath), 'overlay.js');
      finalOverlayUrl = './overlay.js';
    }
  }

  const overlayUrl = process.env.ANNOTY_OVERLAY_URL || finalOverlayUrl;

  // Build the target script tag
  let scriptTag = '';
  if (isCloudMode) {
    scriptTag = `<script src="${overlayUrl}" data-annoty-mode="dev" data-annoty-token="${credentials!.token}"></script>`;
  } else {
    scriptTag = `<script src="${overlayUrl}" data-annoty-mode="dev"></script>`;
  }

  // Check if already injected using regex (matches any script targeting overlay.js)
  const annotyScriptRegex = /<script\s+[^>]*src=["'][^"']*overlay\.js["'][^>]*><\/script>/gi;
  const hasExistingTag = annotyScriptRegex.test(content);

  let updatedContent = '';

  if (hasExistingTag) {
    // Reset regex index for safety
    annotyScriptRegex.lastIndex = 0;
    const existingTag = content.match(annotyScriptRegex)![0];
    
    if (existingTag === scriptTag) {
      console.log(pc.yellow(`\nℹ Annoty script tag is already present and up-to-date in ${pc.cyan(path.relative(cwd, targetPath))}.`));
      return;
    }

    console.log(pc.cyan('\nAn Annoty script tag was detected but with different options. Updating to:'));
    console.log(pc.bold(pc.white(scriptTag)));
    console.log();

    const confirmUpdate = await prompts({
      type: 'confirm',
      name: 'update',
      message: `Update the script tag in ${pc.cyan(path.relative(cwd, targetPath))}?`,
      initial: true,
    });

    if (!confirmUpdate.update) {
      console.log(pc.yellow('Update cancelled.'));
      return;
    }

    // Reset index again to perform replace
    annotyScriptRegex.lastIndex = 0;
    updatedContent = content.replace(annotyScriptRegex, scriptTag);
  } else {
    console.log(pc.cyan('\nThe following script tag will be injected:'));
    console.log(pc.bold(pc.white(scriptTag)));
    console.log();

    const confirmInject = await prompts({
      type: 'confirm',
      name: 'inject',
      message: `Inject this script tag into ${pc.cyan(path.relative(cwd, targetPath))}?`,
      initial: true,
    });

    if (!confirmInject.inject) {
      console.log(pc.yellow('Injection cancelled.'));
      return;
    }

    // Inject
    if (content.includes('</body>')) {
      updatedContent = content.replace('</body>', `  ${scriptTag}\n</body>`);
    } else if (content.includes('</head>')) {
      updatedContent = content.replace('</head>', `  ${scriptTag}\n</head>`);
    } else {
      updatedContent = content + `\n${scriptTag}`;
    }
  }

  // Copy overlay.js locally if available
  if (overlayDestPath && fs.existsSync(sourceOverlayPath)) {
    try {
      fs.copyFileSync(sourceOverlayPath, overlayDestPath);
      console.log(pc.green(`✓ Successfully copied overlay.js to ${pc.cyan(path.relative(cwd, overlayDestPath))}`));
    } catch (err: any) {
      console.log(pc.yellow(`ℹ Warning: Failed to copy overlay.js locally: ${err.message}. Falling back to default URL.`));
    }
  }

  try {
    fs.writeFileSync(targetPath, updatedContent, 'utf8');
    console.log(pc.green(`\n✓ Successfully injected/updated Annoty script tag in ${pc.cyan(path.relative(cwd, targetPath))}`));
    console.log(pc.blue('👉 Please restart your development server to see the changes.\n'));
  } catch (err: any) {
    console.log(pc.red(`\n✗ Error: Failed to write to file: ${err.message}`));
    process.exit(1);
  }
}
