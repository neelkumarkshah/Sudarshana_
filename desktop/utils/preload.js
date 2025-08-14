const { contextBridge, ipcRenderer } = require("electron");

const allowedInvokeChannels = ["registerUser", "loginUser", "verifyUser"];

contextBridge.exposeInMainWorld("api", {
  invoke: async (channel, data) => {
    if (!allowedInvokeChannels.includes(channel)) {
      throw new Error(`Blocked unauthorized invoke channel: ${channel}`);
    }
    return await ipcRenderer.invoke(channel, data);
  },
});
