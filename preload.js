const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveMirror: (json) => ipcRenderer.invoke('data:save-mirror', json),
  loadMirror: () => ipcRenderer.invoke('data:load-mirror'),
  rotateBackup: (json) => ipcRenderer.invoke('backup:rotate', json),
  listBackups: () => ipcRenderer.invoke('backup:list'),
  saveDialog: (opts) => ipcRenderer.invoke('dialog:save', opts),
  openDialog: () => ipcRenderer.invoke('dialog:open'),
  openUserDataFolder: () => ipcRenderer.invoke('folder:open-user-data'),
  openBackupsFolder: () => ipcRenderer.invoke('folder:open-backups'),
  appInfo: () => ipcRenderer.invoke('app:info'),
  minimizeToTray: () => ipcRenderer.invoke('window:minimize-to-tray'),
});
