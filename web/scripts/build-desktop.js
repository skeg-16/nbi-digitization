const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

async function buildDesktop() {
  console.log('--- Starting Desktop App Build ---');

  const rootDir = path.join(__dirname, '..');
  const standaloneDir = path.join(rootDir, '.next', 'standalone');

  try {
    // 1. Build Next.js
    console.log('1. Building Next.js...');
    execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

    // 2. Copy static files to standalone
    console.log('2. Copying Next.js static files to standalone output...');
    if (!fs.existsSync(standaloneDir)) {
      throw new Error('.next/standalone directory not found. Is output: "standalone" set in next.config.mjs?');
    }

    const publicDir = path.join(rootDir, 'public');
    const staticDir = path.join(rootDir, '.next', 'static');

    if (fs.existsSync(publicDir)) {
      fs.copySync(publicDir, path.join(standaloneDir, 'public'));
    }
    
    if (fs.existsSync(staticDir)) {
      const targetStaticDir = path.join(standaloneDir, '.next', 'static');
      fs.ensureDirSync(targetStaticDir);
      fs.copySync(staticDir, targetStaticDir);
    }

    const envFile = path.join(rootDir, '.env');
    if (fs.existsSync(envFile)) {
      fs.copySync(envFile, path.join(standaloneDir, '.env'));
    }

    // 3. Package Electron
    console.log('3. Running Electron Builder...');
    execSync('npx electron-builder --win', { cwd: rootDir, stdio: 'inherit' });

    console.log('--- Build Complete! ---');
    console.log('Check the /dist folder for the .exe file.');

  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildDesktop();
