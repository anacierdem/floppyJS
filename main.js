const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const childProcess = require('child_process');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow () {
	// Create the browser window.
	win = new BrowserWindow({width: 800, height: 600});

	let contents = win.webContents;
	win.webContents.openDevTools();
	// contents.executeJavaScript

	// and load the index.html of the app.
	win.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}))



	// Emitted when the window is closed.
	win.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = null;
	})
}

exports.run = () => {
	const ls = childProcess.spawn('dd', ['if=/Users/alinacierdem/Downloads/Dos6.22.img', 'bs=1440k', 'count=1']);

	var sectors = [];

	for (let i = 0; i < 2880; i++) {
		sectors[i] = new Uint8Array(512);
	}

	var index = 0;
	ls.stdout.on('data', (data) => {
		for (var i = 0; i < data.length; i++) {
			var sectorIndex = Math.floor(index / 512);
			var sectorPosition = index % 512;
			sectors[sectorIndex][sectorPosition] = data[i];
			index++;
		}
		if(index >= 2880*512) {
			win.webContents.send('fileLoaded', sectors);
			console.log("Total: " + index);
		}
	});

	ls.stderr.on('data', (data) => {

	});

	ls.on('close', (code) => {

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
		app.quit()
	}
})

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (win === null) {
		createWindow()
	}
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.