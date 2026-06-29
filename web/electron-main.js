const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

let mainWindow;
let nextProcess;
let ocrProcess;

const OCR_PORT = 8000;
const NEXT_PORT = 3000;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'NBI Digitization System',
  });

  mainWindow.loadURL(`http://localhost:${NEXT_PORT}`);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function startOcrService() {
  const ocrExePath = path.join(process.resourcesPath, 'ocr-service', 'ocr-service.exe');
  const devOcrExePath = path.join(__dirname, '..', 'ocr-service', 'dist', 'ocr-service', 'ocr-service.exe');
  const exeToRun = app.isPackaged ? ocrExePath : devOcrExePath;

  console.log('Starting OCR Service from:', exeToRun);
  
  if (!fs.existsSync(exeToRun)) {
    console.warn(`OCR executable not found at ${exeToRun}. OCR service will not start.`);
    return;
  }

  try {
    ocrProcess = spawn(exeToRun, [], { stdio: 'inherit' });
    ocrProcess.on('error', (err) => {
      console.error('Failed to start OCR process:', err);
    });
  } catch (err) {
    console.error('Synchronous error starting OCR service:', err);
  }
}

function startNextJs() {
  const serverPath = app.isPackaged 
    ? path.join(process.resourcesPath, 'standalone', 'server.js')
    : path.join(__dirname, '.next', 'standalone', 'server.js');

  console.log('Starting Next.js from:', serverPath);
  
  if (!fs.existsSync(serverPath)) {
    console.warn(`Next.js server not found at ${serverPath}. Web app will not start.`);
    return;
  }

  try {
    // We use process.execPath with ELECTRON_RUN_AS_NODE so we don't rely on the user having Node.js installed!
    nextProcess = spawn(process.execPath, [serverPath], {
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: '1',
        PORT: NEXT_PORT.toString(),
        NODE_ENV: 'production',
      },
      stdio: 'pipe'
    });

    const logStream = fs.createWriteStream(path.join(app.getPath('userData'), 'nextjs.log'), { flags: 'a' });
    nextProcess.stdout.pipe(logStream);
    nextProcess.stderr.pipe(logStream);

    nextProcess.on('error', (err) => {
      console.error('Failed to start Next.js process:', err);
    });
  } catch (err) {
    console.error('Synchronous error starting Next.js:', err);
  }
}

function checkServerReady(url, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200 || res.statusCode === 404 || res.statusCode === 307 || res.statusCode === 308) {
          resolve();
        } else {
          retry();
        }
      }).on('error', retry);
    };

    const retry = () => {
      if (Date.now() - startTime > timeoutMs) {
        reject(new Error(`Server at ${url} timeout`));
      } else {
        setTimeout(check, 500);
      }
    };

    check();
  });
}

app.whenReady().then(async () => {
  // Start backend services
  try {
    startOcrService();
    startNextJs();
  } catch (e) {
    console.error('Error in startup flow:', e);
  }

  try {
    console.log('Waiting for Next.js to be ready...');
    await checkServerReady(`http://localhost:${NEXT_PORT}`, 15000);
    console.log('Next.js is ready. Creating window.');
    createWindow();
  } catch (error) {
    console.error('Error waiting for server:', error);
    // Create window anyway to show error or just in case it's actually up
    createWindow();
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}).catch(err => {
  console.error("Critical error during app startup:", err);
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (nextProcess) {
    nextProcess.kill();
  }
  if (ocrProcess) {
    ocrProcess.kill();
  }
});
