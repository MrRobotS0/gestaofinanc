const { app, BrowserWindow, ipcMain, dialog, shell, Menu, Tray, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = process.argv.includes('--dev');

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
  process.exit(0);
}

let mainWindow = null;
let tray = null;
let forceQuit = false;

function ensureDir(dir) {
  try { fs.mkdirSync(dir, { recursive: true }); } catch {}
}

function userDataPath(...parts) {
  return path.join(app.getPath('userData'), ...parts);
}

function mirrorPath() { return userDataPath('bank-data.json'); }
function windowStatePath() { return userDataPath('window-state.json'); }

function backupDir() {
  const d = userDataPath('backups');
  ensureDir(d);
  return d;
}

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ---------- Window state (lembra tamanho/posição) ----------
function loadWindowState() {
  try {
    const raw = fs.readFileSync(windowStatePath(), 'utf8');
    const s = JSON.parse(raw);
    if (s && typeof s.width === 'number' && typeof s.height === 'number') return s;
  } catch {}
  return { width: 1366, height: 860, maximized: false };
}

function saveWindowState(win) {
  try {
    if (!win || win.isDestroyed()) return;
    const bounds = win.getBounds();
    const state = {
      ...bounds,
      maximized: win.isMaximized(),
    };
    fs.writeFileSync(windowStatePath(), JSON.stringify(state, null, 2), 'utf8');
  } catch {}
}

function createWindow() {
  const state = loadWindowState();
  const iconPath = path.join(__dirname, 'build', 'icon.ico');

  mainWindow = new BrowserWindow({
    width: state.width,
    height: state.height,
    x: state.x,
    y: state.y,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: '#0b1020',
    title: 'Bank',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  Menu.setApplicationMenu(null);

  mainWindow.once('ready-to-show', () => {
    if (state.maximized) mainWindow.maximize();
    mainWindow.show();
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });

  // Atalhos
  mainWindow.webContents.on('before-input-event', (_, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === 'i') {
      mainWindow.webContents.toggleDevTools();
    }
    if (input.key === 'F5') mainWindow.webContents.reload();
    if (input.key === 'F11') mainWindow.setFullScreen(!mainWindow.isFullScreen());
  });

  // Salva estado ao mover/redimensionar (debounced)
  let saveTimer = null;
  const scheduleSave = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveWindowState(mainWindow), 500);
  };
  mainWindow.on('resize', scheduleSave);
  mainWindow.on('move', scheduleSave);
  mainWindow.on('maximize', scheduleSave);
  mainWindow.on('unmaximize', scheduleSave);

  // Fechar → minimiza para tray (se tray ativa) ou fecha
  mainWindow.on('close', (e) => {
    if (!forceQuit && tray && !mainWindow.isDestroyed()) {
      e.preventDefault();
      saveWindowState(mainWindow);
      mainWindow.hide();
    } else {
      saveWindowState(mainWindow);
    }
  });
}

function createTray() {
  try {
    const trayIconPath = path.join(__dirname, 'build', 'tray.png');
    if (!fs.existsSync(trayIconPath)) return;

    const img = nativeImage.createFromPath(trayIconPath).resize({ width: 16, height: 16 });
    tray = new Tray(img);
    tray.setToolTip('Bank — Gestão Financeira');

    const menu = Menu.buildFromTemplate([
      {
        label: 'Abrir Bank',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          } else {
            createWindow();
          }
        },
      },
      { type: 'separator' },
      {
        label: 'Pasta de dados',
        click: () => shell.openPath(app.getPath('userData')),
      },
      {
        label: 'Pasta de backups',
        click: () => shell.openPath(backupDir()),
      },
      { type: 'separator' },
      {
        label: 'Sair',
        click: () => {
          forceQuit = true;
          app.quit();
        },
      },
    ]);
    tray.setContextMenu(menu);
    tray.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) mainWindow.hide();
        else { mainWindow.show(); mainWindow.focus(); }
      } else {
        createWindow();
      }
    });
  } catch (err) {
    console.warn('Não foi possível criar o ícone na bandeja:', err);
    tray = null;
  }
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    if (!mainWindow.isVisible()) mainWindow.show();
    mainWindow.focus();
  }
});

app.whenReady().then(() => {
  ensureDir(app.getPath('userData'));
  createTray();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => { forceQuit = true; });

app.on('window-all-closed', () => {
  if (!tray && process.platform !== 'darwin') app.quit();
});

// ============================================================
// IPC
// ============================================================

ipcMain.handle('data:save-mirror', async (_e, json) => {
  try {
    fs.writeFileSync(mirrorPath(), json, 'utf8');
    return { ok: true, path: mirrorPath() };
  } catch (err) { return { ok: false, error: String(err) }; }
});

ipcMain.handle('data:load-mirror', async () => {
  try {
    if (!fs.existsSync(mirrorPath())) return { ok: true, data: null };
    const raw = fs.readFileSync(mirrorPath(), 'utf8');
    return { ok: true, data: JSON.parse(raw) };
  } catch (err) { return { ok: false, error: String(err) }; }
});

ipcMain.handle('backup:rotate', async (_e, json) => {
  try {
    const dir = backupDir();
    const file = path.join(dir, `backup-${todayISO()}.json`);
    fs.writeFileSync(file, json, 'utf8');

    const files = fs.readdirSync(dir)
      .filter(f => /^backup-\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .sort().reverse();
    files.slice(14).forEach(f => { try { fs.unlinkSync(path.join(dir, f)); } catch {} });
    return { ok: true, path: file, kept: Math.min(files.length, 14) };
  } catch (err) { return { ok: false, error: String(err) }; }
});

ipcMain.handle('backup:list', async () => {
  try {
    const dir = backupDir();
    if (!fs.existsSync(dir)) return { ok: true, files: [] };
    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const full = path.join(dir, f);
        const st = fs.statSync(full);
        return { name: f, size: st.size, mtime: st.mtimeMs };
      })
      .sort((a, b) => b.mtime - a.mtime);
    return { ok: true, files };
  } catch (err) { return { ok: false, error: String(err) }; }
});

ipcMain.handle('dialog:save', async (_e, { defaultName, content, filters }) => {
  const res = await dialog.showSaveDialog(mainWindow, {
    title: 'Exportar dados',
    defaultPath: defaultName,
    filters: filters || [{ name: 'JSON', extensions: ['json'] }],
  });
  if (res.canceled || !res.filePath) return { ok: false, canceled: true };
  try {
    fs.writeFileSync(res.filePath, content, 'utf8');
    return { ok: true, path: res.filePath };
  } catch (err) { return { ok: false, error: String(err) }; }
});

ipcMain.handle('dialog:open', async () => {
  const res = await dialog.showOpenDialog(mainWindow, {
    title: 'Importar dados',
    properties: ['openFile'],
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (res.canceled || !res.filePaths?.[0]) return { ok: false, canceled: true };
  try {
    const content = fs.readFileSync(res.filePaths[0], 'utf8');
    return { ok: true, path: res.filePaths[0], content };
  } catch (err) { return { ok: false, error: String(err) }; }
});

ipcMain.handle('folder:open-user-data', async () => {
  try { await shell.openPath(app.getPath('userData')); return { ok: true }; }
  catch (err) { return { ok: false, error: String(err) }; }
});

ipcMain.handle('folder:open-backups', async () => {
  try { await shell.openPath(backupDir()); return { ok: true }; }
  catch (err) { return { ok: false, error: String(err) }; }
});

ipcMain.handle('app:info', async () => ({
  ok: true,
  version: app.getVersion(),
  userDataPath: app.getPath('userData'),
  backupsPath: backupDir(),
  platform: process.platform,
  hasTray: !!tray,
}));

ipcMain.handle('window:minimize-to-tray', async () => {
  if (mainWindow && tray) { mainWindow.hide(); return { ok: true }; }
  return { ok: false };
});
