import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import prompts from 'prompts';

export async function cleanCommand() {
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

  if (!detectedPath) {
    console.log(pc.red('\n✗ Error: No HTML entry point found in the current directory.'));
    console.log(pc.yellow('Make sure you are at the project root to run this clean command.\n'));
    process.exit(1);
  }

  let content = fs.readFileSync(detectedPath, 'utf8');
  const hasScriptTag = content.includes('data-annoty-token') || content.includes('overlay.js');

  const publicOverlay = path.join(cwd, 'public', 'overlay.js');
  const localOverlay = path.join(path.dirname(detectedPath), 'overlay.js');
  const hasLocalScript = fs.existsSync(publicOverlay) || fs.existsSync(localOverlay);

  if (!hasScriptTag && !hasLocalScript) {
    console.log(pc.green('\n✓ Project is already clean. No Annoty remnants found.\n'));
    return;
  }

  console.log(pc.cyan('\n🧹 Annoty Cleanup Scan:'));
  if (hasScriptTag) console.log(`  - Script tag detected in ${pc.blue(path.relative(cwd, detectedPath))}`);
  if (fs.existsSync(publicOverlay)) console.log(`  - Local copy found at ${pc.blue(path.relative(cwd, publicOverlay))}`);
  if (fs.existsSync(localOverlay)) console.log(`  - Local copy found at ${pc.blue(path.relative(cwd, localOverlay))}`);
  console.log();

  const confirmClean = await prompts({
    type: 'confirm',
    name: 'proceed',
    message: 'Remove all Annoty scripts and tags from this project?',
    initial: true,
  });

  if (!confirmClean.proceed) {
    console.log(pc.yellow('Cleanup cancelled.'));
    return;
  }

  // Remove script tag using regex
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
    console.log(pc.bold(pc.green('\n✓ Project successfully cleaned! Ready for production release.\n')));
  } catch (err: any) {
    console.log(pc.red(`\n✗ Error performing cleanup: ${err.message}\n`));
    process.exit(1);
  }
}
