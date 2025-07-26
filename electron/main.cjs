const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { MongoClient } = require('mongodb');
const { Menu } = require('electron');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function fetchBooks() {
  await client.connect();
  const db = client.db("Library");
  const books = await db.collection("Books").find().toArray();
  return books;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  win.loadURL('http://localhost:5173'); // Vite dev server
  
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
});

ipcMain.handle('get-books', async () => {
  return await fetchBooks();
});
