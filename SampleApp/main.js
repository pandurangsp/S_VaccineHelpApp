const { BrowserWindow, app, ipcMain, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
    const win = new BrowserWindow({
        backgroundColor: "white",
        webPreferences: {
            show: false,
            nodeIntegration: true,
            worldSafeExecuteJavaScript: true,
            contextIsolation: true
        }
    });
    win.maximize();
    win.show();
    win.loadFile(path.join(__dirname, "web/index.html"));
}

app.on('ready', createWindow);