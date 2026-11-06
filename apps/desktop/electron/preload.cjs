const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("lifesos", {
  platform: process.platform,
  mockMode: true,
});
