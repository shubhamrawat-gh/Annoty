import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import prompts from 'prompts';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initCommand() {
  console.log(pc.bold(pc.cyan('\n✏️  Annoty — 100% On-Device Visual Inspector & Context Engine')));
  console.log(pc.dim('Zero cloud, zero API, local-first DOM debugging.\n'));

  const cwd = process.cwd();

  // 1. Detect HTML files
  const possibleHtmlPaths = [
    path.join(cwd, 'index.html'),
    path.join(cwd, 'public', 'index.html'),
    path.join(cwd, 'src', 'index.html'),
    path.join(cwd, 'demo-site', 'index.html'),
  ];

  let detectedHtml: string | null = null;
  for (const p of possibleHtmlPaths) {
    if (fs.existsSync(p)) {
      detectedHtml = p;
      break;
    }
  }

  // 2. Detect JS/TS entrypoint files
  const possibleCodePaths = [
    path.join(cwd, 'src', 'main.tsx'),
    path.join(cwd, 'src', 'main.jsx'),
    path.join(cwd, 'src', 'index.tsx'),
    path.join(cwd, 'src', 'index.jsx'),
    path.join(cwd, 'src', 'App.tsx'),
    path.join(cwd, 'src', 'App.jsx'),
  ];

  let detectedCode: string | null = null;
  for (const p of possibleCodePaths) {
    if (fs.existsSync(p)) {
      detectedCode = p;
      break;
    }
  }

  // Determine overlay asset location
  const sourceOverlayPath = path.resolve(__dirname, '..', 'overlay.js');
  const publicDir = path.join(cwd, 'public');
  let overlayDestPath = '';
  let finalOverlayUrl = '/overlay.js';

  if (fs.existsSync(publicDir)) {
    overlayDestPath = path.join(publicDir, 'overlay.js');
    finalOverlayUrl = '/overlay.js';
  } else if (detectedHtml) {
    overlayDestPath = path.join(path.dirname(detectedHtml), 'overlay.js');
    finalOverlayUrl = './overlay.js';
  } else {
    overlayDestPath = path.join(cwd, 'overlay.js');
    finalOverlayUrl = '/overlay.js';
  }

  const choices = [];
  if (detectedHtml) {
    choices.push({
      title: `HTML Script Tag (Inject into ${path.relative(cwd, detectedHtml)})`,
      value: 'html',
    });
  }
  if (detectedCode) {
    choices.push({
      title: `JavaScript/TypeScript Import (Add import 'annoty' to ${path.relative(cwd, detectedCode)})`,
      value: 'import',
    });
  }
  choices.push({
    title: 'Custom File Path',
    value: 'custom',
  });

  const methodSelect = await prompts({
    type: 'select',
    name: 'method',
    message: 'How would you like to load Annoty in this project?',
    choices,
    initial: 0,
  });

  if (!methodSelect.method) {
    console.log(pc.yellow('Initialization cancelled.\n'));
    return;
  }

  if (methodSelect.method === 'import' && detectedCode) {
    // Add import 'annoty';
    try {
      const codeContent = fs.readFileSync(detectedCode, 'utf8');
      if (codeContent.includes("from 'annoty'") || codeContent.includes("import 'annoty'")) {
        console.log(pc.green(`\n✓ Annoty is already imported in ${pc.cyan(path.relative(cwd, detectedCode))}`));
      } else {
        const updated = `import 'annoty';\n` + codeContent;
        fs.writeFileSync(detectedCode, updated, 'utf8');
        console.log(pc.green(`\n✓ Added import 'annoty' to ${pc.cyan(path.relative(cwd, detectedCode))}`));
      }
    } catch (err: any) {
      console.log(pc.red(`\n✗ Error modifying ${detectedCode}: ${err.message}`));
      return;
    }
  } else {
    // HTML Script injection
    let targetPath = detectedHtml;

    if (methodSelect.method === 'custom' || !targetPath) {
      const manualPrompt = await prompts({
        type: 'text',
        name: 'filePath',
        message: 'Enter the path to your HTML file (e.g. index.html or public/index.html):',
        validate: (val) => (val && val.trim().length > 0 ? true : 'Please enter a path'),
      });
      if (!manualPrompt.filePath) {
        console.log(pc.yellow('Initialization cancelled.\n'));
        return;
      }
      targetPath = path.resolve(cwd, manualPrompt.filePath);
      if (!fs.existsSync(targetPath)) {
        console.log(pc.red(`\n✗ Error: File "${targetPath}" does not exist.\n`));
        return;
      }
    }

    // Read content
    let content = fs.readFileSync(targetPath!, 'utf8');

    // Copy overlay.js if available
    if (fs.existsSync(sourceOverlayPath)) {
      try {
        if (!fs.existsSync(path.dirname(overlayDestPath))) {
          fs.mkdirSync(path.dirname(overlayDestPath), { recursive: true });
        }
        fs.copyFileSync(sourceOverlayPath, overlayDestPath);
        console.log(pc.green(`✓ Copied overlay.js to ${pc.cyan(path.relative(cwd, overlayDestPath))}`));
      } catch (err: any) {
        console.log(pc.yellow(`ℹ Warning copying overlay.js: ${err.message}`));
      }
    }

    const scriptTag = `<script src="${finalOverlayUrl}" data-annoty-mode="dev"></script>`;

    if (content.includes('overlay.js') || content.includes('data-annoty-mode')) {
      console.log(pc.yellow(`\nℹ Annoty script tag is already present in ${pc.cyan(path.relative(cwd, targetPath!))}`));
    } else {
      let updatedContent = '';
      if (content.includes('</body>')) {
        updatedContent = content.replace('</body>', `  ${scriptTag}\n</body>`);
      } else if (content.includes('</head>')) {
        updatedContent = content.replace('</head>', `  ${scriptTag}\n</head>`);
      } else {
        updatedContent = content + `\n${scriptTag}`;
      }

      fs.writeFileSync(targetPath!, updatedContent, 'utf8');
      console.log(pc.green(`✓ Injected Annoty script tag into ${pc.cyan(path.relative(cwd, targetPath!))}`));
    }
  }

  // 3. Create default annoty.config.json if not present
  const configPath = path.join(cwd, 'annoty.config.json');
  if (!fs.existsSync(configPath)) {
    const defaultConfig = {
      framework: 'auto',
      sourceRoot: 'src',
      captureScreenshots: true,
      includeComputedStyles: true,
      responsivePresets: [
        { name: 'Mobile', width: 375, height: 667 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Desktop', width: 1440, height: 900 },
      ],
    };
    try {
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2) + '\n', 'utf8');
      console.log(pc.green(`✓ Generated project configuration at ${pc.cyan('annoty.config.json')}`));
    } catch {}
  }

  console.log(pc.bold(pc.green('\n🎉 Annoty setup complete!')));
  console.log(pc.dim('Run your development server and press "I" or click the floating widget to start inspecting.\n'));
}
