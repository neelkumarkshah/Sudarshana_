const { app, BrowserWindow, ipcMain, screen } = require("electron/main");
const path = require("node:path");
const isDev = require("electron-is-dev");
const { autoUpdater } = require("electron-updater");

let mainWindow;

const createWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width,
    height,
    icon: path.join(
      __dirname,
      "assets",
      process.platform === "win32"
        ? "sudarshana.ico"
        : process.platform === "darwin"
        ? "sudarshana.icns"
        : "sudarshana.png"
    ),
    title: "Sudarshana - E-Rakshak",
    webPreferences: {
      preload: path.join(__dirname, "utils", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    fullscreenable: true,
    resizable: true,
  });

  mainWindow.maximize();

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "client", "build", "index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  autoUpdater.checkForUpdatesAndNotify();
};

app.whenReady().then(() => {
  setupIPC();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
