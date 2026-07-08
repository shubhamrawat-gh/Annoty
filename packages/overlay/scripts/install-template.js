const fs = require('fs');
const path = require('path');

// The bundle code will be injected here during the build step
const OVERLAY_CODE = `/* BUNDLE_CONTENT */`;

const TARGET_FILES = [
  'index.html',
  'public/index.html',
  'src/index.html',
  'app/layout.tsx',
  'app/layout.jsx',
  'app/layout.js',
  'src/app/layout.tsx',
  'src/app/layout.jsx',
  'src/app/layout.js',
  'pages/_document.tsx',
  'pages/_document.jsx',
  'pages/_document.js',
  'src/pages/_document.tsx',
  'src/pages/_document.jsx',
  'src/pages/_document.js',
];

function log(msg) {
  console.log(`\x1b[36m[Annoty-Installer]\x1b[0m ${msg}`);
}

function logError(msg) {
  console.error(`\x1b[31m[Annoty-Installer] Error: ${msg}\x1b[0m`);
}

function run() {
  log('Starting automatic installation...');

  // 1. Find a place to write overlay.js
  // We prefer public/, then src/public/, then fallback to the root dir
  let publicDir = '';
  if (fs.existsSync(path.join(process.cwd(), 'public'))) {
    publicDir = path.join(process.cwd(), 'public');
  } else if (fs.existsSync(path.join(process.cwd(), 'src', 'public'))) {
    publicDir = path.join(process.cwd(), 'src', 'public');
  } else {
    // Create public directory if it doesn't exist
    publicDir = path.join(process.cwd(), 'public');
    try {
      fs.mkdirSync(publicDir, { recursive: true });
      log('Created public/ folder.');
    } catch (e) {
      logError('Failed to create public/ directory.');
      process.exit(1);
    }
  }

  const annotyDir = path.join(publicDir, 'annoty');
  try {
    fs.mkdirSync(annotyDir, { recursive: true });
  } catch (e) {
    logError('Failed to create public/annoty/ directory.');
    process.exit(1);
  }

  const scriptPath = path.join(annotyDir, 'overlay.js');
  try {
    fs.writeFileSync(scriptPath, OVERLAY_CODE, 'utf8');
    log(`Successfully created local asset at: public/annoty/overlay.js`);
  } catch (e) {
    logError(`Failed to write overlay.js: ${e.message}`);
    process.exit(1);
  }

  // 2. Scan and inject the script tag
  let injected = false;
  const scriptTag = '<script src="/annoty/overlay.js" data-annoty-mode="dev"></script>';

  for (const targetName of TARGET_FILES) {
    const filePath = path.join(process.cwd(), targetName);
    if (fs.existsSync(filePath)) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Skip if already injected
        if (content.includes('annoty/overlay.js')) {
          log(`Annoty script tag already exists in: ${targetName}`);
          injected = true;
          break;
        }

        // Inject before body close or html close or at the end
        if (content.includes('</body>')) {
          content = content.replace('</body>', `  ${scriptTag}\n</body>`);
        } else if (content.includes('</html>')) {
          content = content.replace('</html>', `  ${scriptTag}\n</html>`);
        } else {
          // If no body or html tag (e.g. Next.js App Router body wrapper), append to end of file
          content = `${content}\n${scriptTag}\n`;
        }

        fs.writeFileSync(filePath, content, 'utf8');
        log(`Successfully injected script tag into: \x1b[32m${targetName}\x1b[0m`);
        injected = true;
        break;
      } catch (err) {
        logError(`Failed to modify ${targetName}: ${err.message}`);
      }
    }
  }

  if (!injected) {
    logError('Could not find any suitable index.html or layout file to inject the script tag automatically.');
    log(`Please manually add the script tag to your main layout:\n\n  ${scriptTag}\n`);
  } else {
    log('\x1b[32mInstallation complete! Start your local server and enjoy Annoty ✏️\x1b[0m');
  }
}

run();
