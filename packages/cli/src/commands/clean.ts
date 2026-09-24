import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import prompts from 'prompts';

/**
 * Recursively scans directory for files matching test function, ignoring node_modules, dist, etc.
 */
function findFiles(dir: string, filter: (file: string) => boolean, maxDepth = 4, depth = 0): string[] {
  if (depth > maxDepth || !fs.existsSync(dir)) return [];
  const results: string[] = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (['node_modules', 'dist', 'build', '.git', '.next', '.nuxt', 'coverage'].includes(entry.name)) {
          continue;
        }
        results.push(...findFiles(fullPath, filter, maxDepth, depth + 1));
      } else if (entry.isFile() && filter(entry.name)) {
        results.push(fullPath);
      }
    }
  } catch {
    // Ignore unreadable dirs
  }

  return results;
}

export async function cleanCommand() {
  const cwd = process.cwd();

  console.log(pc.cyan('\n🔍 Scanning project for Annoty scripts, imports, and assets...'));

  // 1. Find all HTML files
  const htmlFiles = findFiles(cwd, (name) => name.endsWith('.html'));

  // 2. Find common entrypoint source files for imports
  const srcFiles = findFiles(cwd, (name) => /\.(tsx?|jsx?|vue|svelte|astro)$/.test(name));

  // 3. Find physical overlay asset files
  const potentialAssetPaths = [
    path.join(cwd, 'overlay.js'),
    path.join(cwd, 'public', 'overlay.js'),
    path.join(cwd, 'public', 'annoty', 'overlay.js'),
    path.join(cwd, 'src', 'overlay.js'),
    path.join(cwd, 'annoty.config.json'),
  ];

  const affectedHtmlFiles: string[] = [];
  const affectedSrcFiles: string[] = [];
  const existingAssets: string[] = potentialAssetPaths.filter((p) => fs.existsSync(p));

  // Regex patterns
  const htmlScriptRegex = /([ \t]*<!--[^\n]*Annoty[^\n]*-->\r?\n)?([ \t]*<script\b[^>]*(?:annoty|overlay\.js|data-annoty-mode|data-annoty-token)[^>]*>[\s\S]*?<\/script>\r?\n?)/gi;
  const jsImportRegex = /^[ \t]*import\s+['"](?:annoty|@annoty\/overlay)['"];?\r?\n?/gm;
  const jsInitRegex = /^[ \t]*import\s+\{[^}]*initAnnoty[^}]*\}\s+from\s+['"]annoty['"];?\r?\n?|^[ \t]*initAnnoty\(\);?\r?\n?/gm;

  // Scan HTML files
  for (const file of htmlFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (htmlScriptRegex.test(content) || content.includes('overlay.js') || content.includes('data-annoty-mode')) {
        affectedHtmlFiles.push(file);
      }
    } catch {}
  }

  // Scan Source files for imports
  for (const file of srcFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('annoty') || content.includes('initAnnoty')) {
        affectedSrcFiles.push(file);
      }
    } catch {}
  }

  const totalRemnants = affectedHtmlFiles.length + affectedSrcFiles.length + existingAssets.length;

  if (totalRemnants === 0) {
    console.log(pc.green('✓ Project is completely clean. No Annoty remnants found.\n'));
    return;
  }

  console.log(pc.yellow(`\nFound ${totalRemnants} Annoty artifact(s) to clean:`));
  affectedHtmlFiles.forEach((f) => console.log(`  - Script tag in: ${pc.blue(path.relative(cwd, f))}`));
  affectedSrcFiles.forEach((f) => console.log(`  - Code import in: ${pc.blue(path.relative(cwd, f))}`));
  existingAssets.forEach((f) => console.log(`  - Asset file: ${pc.blue(path.relative(cwd, f))}`));
  console.log();

  const confirmClean = await prompts({
    type: 'confirm',
    name: 'proceed',
    message: 'Remove all Annoty scripts, imports, and assets from this project?',
    initial: true,
  });

  if (!confirmClean.proceed) {
    console.log(pc.yellow('Cleanup cancelled.\n'));
    return;
  }

  let cleanedCount = 0;

  // Clean HTML files
  for (const file of affectedHtmlFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const updated = content.replace(htmlScriptRegex, '');
      if (updated !== content) {
        fs.writeFileSync(file, updated, 'utf8');
        console.log(pc.green(`✓ Removed Annoty script tag from ${pc.blue(path.relative(cwd, file))}`));
        cleanedCount++;
      }
    } catch (err: any) {
      console.log(pc.red(`✗ Failed to update ${file}: ${err.message}`));
    }
  }

  // Clean Source files
  for (const file of affectedSrcFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      let updated = content.replace(jsImportRegex, '').replace(jsInitRegex, '');
      if (updated !== content) {
        fs.writeFileSync(file, updated, 'utf8');
        console.log(pc.green(`✓ Removed Annoty imports from ${pc.blue(path.relative(cwd, file))}`));
        cleanedCount++;
      }
    } catch (err: any) {
      console.log(pc.red(`✗ Failed to update ${file}: ${err.message}`));
    }
  }

  // Delete physical assets
  for (const assetPath of existingAssets) {
    try {
      if (fs.existsSync(assetPath)) {
        fs.unlinkSync(assetPath);
        console.log(pc.green(`✓ Deleted ${pc.blue(path.relative(cwd, assetPath))}`));
        cleanedCount++;
      }
    } catch (err: any) {
      console.log(pc.red(`✗ Failed to delete ${assetPath}: ${err.message}`));
    }
  }

  // Check if public/annoty directory is empty and delete it
  const publicAnnotyDir = path.join(cwd, 'public', 'annoty');
  try {
    if (fs.existsSync(publicAnnotyDir) && fs.readdirSync(publicAnnotyDir).length === 0) {
      fs.rmdirSync(publicAnnotyDir);
    }
  } catch {}

  console.log(pc.bold(pc.green(`\n✓ Successfully removed ${cleanedCount} item(s). Your project is clean and production-ready!\n`)));
}
