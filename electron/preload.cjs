const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getBooks: () => ipcRenderer.invoke('get-books'),
});
