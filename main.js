const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ width: 800, height: 600 });

  win.webContents.openDevTools();

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
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
  if (win === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

exports.loadData = () => {
  const EXPECTED_FILE_SIZE = 2880 * 512;

  // TODO: add support for direct  disk acces using
  // https://github.com/ronomon/direct-io This will enable manipulating
  // combined floopy data e.g for floppy emulator flash drives.
  dialog.showOpenDialog(win, {}, function (filePaths) {
    // No files selected
    if (!filePaths) {
      return;
    }
    if (filePaths.length > 1 || filePaths.length === 0) {
      // This is not possible on a Windows system. Must check for other OSes
      // TODO: remove if unnecessary.
      dialog.showMessageBox(win, {
        type: 'error',
        message: 'Select only one file.',
        title: 'Unexpected input'
      });
    } else {
      // Prepare sector buffers
      // TODO: this may be a one contiguous buffer as well.
      let currentIndex = 0;
      let sectors = [];

      for (let i = 0; i < 2880; i++) {
        sectors[i] = new Uint8Array(512);
      }

      let stats = fs.statSync(filePaths[0]);

      if (stats.size !== EXPECTED_FILE_SIZE) {
        dialog.showMessageBox(win, {
          type: 'error',
          message: 'Not a valid floppy image.',
          title: 'Unexpected input'
        });

        return;
      }

      let stream = fs.createReadStream(filePaths[0], {
        start: 0,
        end: EXPECTED_FILE_SIZE
      });

      stream.on('data', (chunk) => {
        for (let i = 0; i < chunk.length; i++) {
          let sectorIndex = Math.floor(currentIndex / 512);
          let sectorPosition = currentIndex % 512;

          sectors[sectorIndex][sectorPosition] = chunk[i];
          currentIndex++;
        }
      });

      stream.on('end', () => {
        win.webContents.send('fileLoaded', sectors);
      });

      stream.on('error', () => {
        dialog.showMessageBox(win, {
          type: 'error',
          message: 'Error reading file.',
          title: 'Read error'
        });
      });
    }
  });
};
