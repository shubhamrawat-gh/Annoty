const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../dist');
const templatePath = path.resolve(__dirname, 'install-template.js');
const outputPath = path.resolve(distDir, 'install-annoty.js');
const overlayPath = path.resolve(distDir, 'overlay.js');

// Ensure output directories exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

if (!fs.existsSync(overlayPath)) {
  console.error('[Annoty-CLI-Generator] Error: overlay.js must be built first before generating the CLI installer.');
  process.exit(1);
}

try {
  const overlayCode = fs.readFileSync(overlayPath, 'utf8');
  const templateCode = fs.readFileSync(templatePath, 'utf8');

  // Escape backticks, backslashes and dollar signs so they can reside safely within the template's backtick string
  const escapedOverlayCode = overlayCode
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  const finalCode = templateCode.replace('/* BUNDLE_CONTENT */', escapedOverlayCode);

  fs.writeFileSync(outputPath, finalCode, 'utf8');
  console.log('[Annoty-CLI-Generator] Successfully generated single-file installer at: packages/overlay/dist/install-annoty.js');
} catch (err) {
  console.error('[Annoty-CLI-Generator] Failed to generate installer:', err.message);
  process.exit(1);
}
