const { BrowserWindow, app, ipcMain, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
    const win = new BrowserWindow({
        backgroundColor: "white",
        webPreferences: {
            devTools: true,
            show: false,
            nodeIntegration: true,
            worldSafeExecuteJavaScript: true,
            contextIsolation: true
        }
    });
    win.setMenuBarVisibility(false);
    win.maximize();
    win.show();
    win.loadFile(path.join(__dirname, "web/index.html"));
}

app.on('ready', createWindow);