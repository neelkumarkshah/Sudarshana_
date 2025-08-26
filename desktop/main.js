const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  screen,
  dialog,
} = require("electron/main");
const path = require("node:path");
const isDev = require("electron-is-dev");
const { autoUpdater } = require("electron-updater");
const dotenv = require("dotenv");
const fetch = require("node-fetch");
const FormData = require("form-data");
const fs = require("fs");

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

const setupMenu = () => {
  const template = [
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About Sudarshana",
          click: () => {
            dialog.showMessageBox({
              type: "info",
              title: "About Sudarshana",
              message: "Sudarshana - E-Rakshak",
              detail:
                "Version: " +
                app.getVersion() +
                "\n\nSudarshana – E-Rakshak provides advanced automated VAPT solutions to help businesses safeguard their digital assets with innovative and efficient security.",
              buttons: ["OK"],
            });
          },
        },
        {
          label: "Check for Updates",
          click: () => {
            autoUpdater.checkForUpdatesAndNotify();
          },
        },
      ],
    },
  ];

  if (process.platform === "darwin") {
    template.unshift({
      label: app.name,
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    });
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
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

      return {
        success: true,
        message: "Verified successfully",
        userExists: resData.userExists,
      };
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

  ipcMain.handle("fetchScan", async (event, { token, userId }) => {
    try {
      if (!token) throw new Error("Token is required");
      if (!userId) throw new Error("UserId is required");

      const response = await fetch(
        `${process.env.BACKEND_URL}/users/scans/${userId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const resData = await response.json();

      if (!response.ok)
        throw new Error(resData.message || "Failed to fetch scan data");

      return { success: true, data: resData.scanRecords || [] };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle(
    "startScan",
    async (event, { url, applicationName, scanType, userId, token }) => {
      try {
        if (!url || !applicationName || !scanType || !userId) {
          throw new Error("Missing required scan parameters");
        }
        if (!token) throw new Error("Authorization token is required");

        const response = await fetch(
          `${process.env.BACKEND_URL}/pentesting/startScan`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ url, applicationName, scanType, userId }),
          }
        );

        const resData = await response.json();

        if (!response.ok) throw new Error(resData.message || "Scan failed");

        return { success: true, data: resData };
      } catch (error) {
        return { success: false, message: error.message };
      }
    }
  );

  ipcMain.handle(
    "uploadPDF",
    async (event, { scanId, pdfBuffer, pdfName, token }) => {
      try {
        if (!scanId || !pdfBuffer)
          throw new Error("Missing scan id or PDF file path");

        if (!token) throw new Error("Authorization token is required");

        const buffer = Buffer.from(pdfBuffer);

        const formData = new FormData();
        formData.append("scanId", scanId);
        formData.append("pdfFile", buffer, {
          filename: pdfName,
          contentType: "application/pdf",
        });

        const response = await fetch(
          `${process.env.BACKEND_URL}/pentesting/uploadPdf`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const resData = await response.json();

        if (!response.ok) throw new Error(resData.message || "Upload failed");

        return { success: true, ...resData };
      } catch (error) {
        return { success: false, message: error.message };
      }
    }
  );

  ipcMain.handle(
    "downloadPDF",
    async (event, { scanId, token, applicationName }) => {
      try {
        if (!scanId) throw new Error("Scan ID is required");
        if (!token) throw new Error("Token is required");

        const response = await fetch(
          `${process.env.BACKEND_URL}/pentesting/downloadPdf/${scanId}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || "Failed to download PDF");
        }

        const buffer = Buffer.from(await response.arrayBuffer());

        return {
          success: true,
          file: buffer.toString("base64"),
          pdfName: `${applicationName}_Security_Assessment_Report.pdf`,
        };
      } catch (error) {
        return { success: false, message: error.message };
      }
    }
  );
};

app.whenReady().then(() => {
  createWindow();
  setupMenu();
  setupIPC();

  app.on("activate", () => {
    if (mainWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
