const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

const isProduction = process.env.NODE_ENV !== 'development';

let winHandle;

function createWindow () {
  winHandle = exports.winHandle = new BrowserWindow({ width: 1024, height: 768 });

  winHandle.webContents.openDevTools();

  if (isProduction) {
    winHandle.loadURL(url.format({
      pathname: path.join(__dirname, '../../dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  } else {
    // TODO: get URL programmatically
    winHandle.loadURL('http://localhost:8081/');
  }

  winHandle.on('closed', () => {
    winHandle = null;
    exports.winHandle = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (winHandle === null) {
    createWindow();
  }
});
