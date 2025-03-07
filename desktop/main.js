const { app, BrowserWindow, ipcMain, screen } = require("electron/main");
const path = require("node:path");

const createWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
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
    // autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "utils", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    fullscreenable: true,
    resizable: true,
  });

  win.maximize();

  win.loadURL("http://localhost:3000");

  win.on("closed", () => {
    win = null;
  });

  // win.loadFile("index.html");
};

app.whenReady().then(() => {
  ipcMain.handle("ping", () => "pong");
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
