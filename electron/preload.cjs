const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Book-related methods
  getBooks: () => ipcRenderer.invoke('get-books'),
  addBook: (data) => ipcRenderer.invoke('add-book', data),
  updateBook: (data) => ipcRenderer.invoke('update-book', data),
  deleteBook: (bookId) => ipcRenderer.invoke('delete-book', bookId),
  
  // Issue-related methods
  issueBook: (data) => ipcRenderer.invoke('issue-book', data),
  getIssues: () => ipcRenderer.invoke('get-issues'),
  markReturned: (issueId, status) => ipcRenderer.invoke('mark-returned', { issueId, status }),
  updateIssue: (issueData) => ipcRenderer.invoke('update-issue', issueData),
  
  // Member-related methods (updated to match your exact implementation)
  getMembers: () => ipcRenderer.invoke('getMembers'),
  addMember: (memberData) => ipcRenderer.invoke('addMember', memberData),
  updateMember: (userNo, updateData) => ipcRenderer.invoke('updateMember', userNo, updateData),
  deleteMember: (userNo) => ipcRenderer.invoke('deleteMember', userNo),
  
  // Utility methods (if you need them)
  // getNextSequence: (name) => ipcRenderer.invoke('get-next-sequence', name)
});