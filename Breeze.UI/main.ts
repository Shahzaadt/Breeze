const electron = require('electron');

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const os = require('os');

let serve;
const args = process.argv.slice(1);
serve = args.some(val => val === "--serve");

if (serve) {
  require('electron-reload')(__dirname, {
    electron: require('${__dirname}/../../node_modules/electron')
  });
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;

function createWindow() {

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1200, height: 700, frame: true, minWidth: 1200, minHeight: 700, icon: "./assets/images/stratis-tray.png"});

   // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  if (serve) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
  if (serve) {
    console.log("Breeze UI was started in development mode. This requires the user to be running the Breeze Daemon himself.")
  }
  else {
    startApi();
  }
  createTray();
  createWindow();
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

function startApi() {
  var apiProcess;
  const spawn = require('child_process').spawn;

  //Start Breeze Daemon
  let apipath = path.join(__dirname, '..//..//daemon//Breeze.Daemon');
  if (os.platform() === 'win32') {
      apipath = path.join(__dirname, '.\\assets\\daemon\\Breeze.Daemon.exe');
  }

  apiProcess = spawn(apipath + ' light -testnet', {
      detached: true
  });

  apiProcess.stdout.on('data', (data) => {
      writeLog(`stdout: ${data}`);
      if (mainWindow == null) {
          createWindow();
      }
  });
}

function createTray() {
  //Put the app in system tray
  const Menu = electron.Menu;
  const Tray = electron.Tray;

  let appIcon = null;

  const iconName = process.platform === 'win32' ? './assets/images/stratis-tray.png' : './assets/images/stratis-tray.png';
  const iconPath = path.join(__dirname, iconName);
  appIcon = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([{
    label: 'Hide/Show',
    click: function () {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
  }]);
  appIcon.setToolTip('Breeze Wallet');
  appIcon.setContextMenu(contextMenu);

  app.on('window-all-closed', function () {
    if (appIcon) appIcon.destroy();
  });
};

function writeLog(msg) {
    console.log(msg);
};
