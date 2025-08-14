const { app, BrowserWindow, ipcMain, screen } = require("electron/main");
const path = require("node:path");
const isDev = require("electron-is-dev");
const { autoUpdater } = require("electron-updater");
const dotenv = require("dotenv");

dotenv.config();

let mainWindow;

const createWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const getIconPath = () => {
    const base = app.isPackaged ? process.resourcesPath : __dirname;
    const iconName =
      process.platform === "win32"
        ? "sudarshana.ico"
        : process.platform === "darwin"
        ? "sudarshana.icns"
        : "sudarshana.png";

    return path.join(base, "assets", iconName);
  };

  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: 1200,
    minHeight: 800,
    icon: getIconPath(),
    title: "Sudarshana - E-Rakshak",
    webPreferences: {
      preload: path.join(__dirname, "utils", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false,
    },
    fullscreenable: true,
    resizable: true,
  });

  mainWindow.maximize();

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "client", "build", "index.html"));
    autoUpdater.checkForUpdatesAndNotify();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

const setupIPC = () => {
  ipcMain.handle("registerUser", async (event, data) => {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok)
        throw new Error(resData.message || "Registration failed");

      return {
        success: true,
        message: "Registered successfully",
        data: resData,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle("verifyUser", async (event, data) => {
    try {
      const token = data?.token;
      if (!token) throw new Error("Token is required");

      const response = await fetch(
        `${process.env.BACKEND_URL}/users/verifyUsers`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const resData = await response.json();

      if (!response.ok)
        throw new Error(resData.message || "User verification failed");

      return { success: true, userExists: resData.userExists };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle("loginUser", async (event, data) => {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) throw new Error(resData.message || "Login failed");

      return { success: true, data: resData };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });
};

app.whenReady().then(() => {
  setupIPC();
  createWindow();

  app.on("activate", () => {
    if (mainWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
