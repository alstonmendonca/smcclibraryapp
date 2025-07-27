const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getBooks: () => ipcRenderer.invoke('get-books'),
  addBook: (data) => ipcRenderer.invoke('add-book', data),
  updateBook: (data) => ipcRenderer.invoke('update-book', data),
  issueBook: (data) => ipcRenderer.invoke('issue-book', data),
  getIssues: () => ipcRenderer.invoke('get-issues'), // ✅ Add this
  markReturned: (issueId, status) => ipcRenderer.invoke('mark-returned', { issueId, status }), // for tick/cross
  updateIssue: (issueData) => ipcRenderer.invoke('update-issue', issueData), // for double-click edit
  deleteBook: (bookId) => ipcRenderer.invoke('delete-book', bookId),
});
