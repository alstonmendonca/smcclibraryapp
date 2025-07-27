const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { MongoClient } = require('mongodb');
const { Menu } = require('electron');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db; // global DB instance

async function connectDB() {
  try {
    await client.connect();
    db = client.db("Library");
    console.log("✅ Connected to MongoDB");
    
    // Ensure counters collection exists and has initial values
    const counters = db.collection("Counters");
    await counters.updateOne(
      { _id: "issueId" },
      { $setOnInsert: { seq: 0 } },
      { upsert: true }
    );
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err);
  }
}

async function getNextSequence(sequenceName) {
  const counters = db.collection("Counters");
  const result = await counters.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  return result.seq;
}

async function fetchBooks() {
  return await db.collection("Books").find().toArray();
}

async function fetchIssues() {
  return await db.collection("Issues").find().toArray();
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

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);
  await connectDB();
  createWindow();
});

ipcMain.handle('get-books', fetchBooks);
ipcMain.handle('get-issues', fetchIssues);

ipcMain.handle('issue-book', async (event, issueData) => {
  try {
    const nextId = await getNextSequence('issueId');
    const issueWithId = { issueId: nextId, ...issueData };
    await db.collection('Issues').insertOne(issueWithId);
    return { success: true, issueId: nextId };
  } catch (err) {
    console.error("❌ Failed to issue book:", err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('mark-returned', async (event, { issueId, status }) => {
  if (typeof issueId !== "number") {
    throw new Error("Invalid issueId, must be a number");
  }
  return await db.collection('Issues').updateOne(
    { issueId },
    { $set: { returned: status } }
  );
});

ipcMain.handle('update-issue', async (event, data) => {
  const { issueId, _id, ...rest } = data;  // exclude _id from update fields
  if (typeof issueId !== "number") {
    throw new Error("Invalid issueId, must be a number");
  }
  // Now rest does NOT contain _id, safe to $set
  return await db.collection('Issues').updateOne(
    { issueId },
    { $set: rest }
  );
});
