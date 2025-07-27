const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getBooks: () => ipcRenderer.invoke('get-books'),
  issueBook: (data) => ipcRenderer.invoke('issue-book', data),
  getIssues: () => ipcRenderer.invoke('get-issues'), // ✅ Add this
  markReturned: (issueId, status) => ipcRenderer.invoke('mark-returned', { issueId, status }), // for tick/cross
  updateIssue: (issueData) => ipcRenderer.invoke('update-issue', issueData), // for double-click edit
});
