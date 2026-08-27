import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { autoUpdater } from 'electron-updater'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })
  
  win.maximize() // Maximize the window by default

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  // Setup auto updater
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify()
  }, 3000);

  autoUpdater.on('update-available', () => {
    win?.webContents.send('update-available')
  })

  autoUpdater.on('update-downloaded', () => {
    win?.webContents.send('update-downloaded')
  })

  autoUpdater.on('error', (err) => {
    win?.webContents.send('update-error', err == null ? "unknown" : (err.stack || err).toString())
  })

  autoUpdater.on('update-not-available', () => {
    win?.webContents.send('update-error', "No new updates found on GitHub.")
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()
})

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall()
})

ipcMain.on('check_for_updates', () => {
  autoUpdater.checkForUpdatesAndNotify()
})

ipcMain.on('save_pdf_backup', async (event, { html, filename }) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    
    const baseDir = 'C:\\Mona Interiors Documents';
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    
    const filePath = path.join(baseDir, filename);
    const tempHtmlPath = path.join(os.tmpdir(), `temp_print_${Date.now()}.html`);
    
    const basePath = process.env.VITE_PUBLIC ? process.env.VITE_PUBLIC.replace(/\\/g, '/') : '';
    const finalHtml = html.replace(/src="\.\//g, `src="file:///${basePath}/`);
    
    // Write HTML to a temp file to avoid data URI size limits
    fs.writeFileSync(tempHtmlPath, finalHtml);

    const printWin = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    await printWin.loadFile(tempHtmlPath);
    
    // Wait a bit for external resources (like logos) to load
    setTimeout(async () => {
      try {
        const pdfData = await printWin.webContents.printToPDF({
          printBackground: true,
          pageSize: 'A4',
          marginType: 1 // No margin, let CSS handle it
        });
        
        fs.writeFileSync(filePath, pdfData);
      } catch (e) {
        console.error('Failed to generate PDF:', e);
      } finally {
        if (!printWin.isDestroyed()) printWin.destroy();
        // Clean up temp file
        if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
      }
    }, 1500);

  } catch (error) {
    console.error('Error saving PDF backup:', error);
  }
});
