// boilerplate from https://steemit.com/education/@ryanbaer/getting-started-with-electron-a-basic-menubar-app-part-1

const {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  nativeImage,
  dialog
} = require('electron');
const path = require('path');

let tray = undefined;
let window = undefined;

app.dock.hide();

app.on('ready', () => {
  tray = new Tray(path.join(__dirname, "./BlackbirdTemplate.png"));
  //tray.setHighlightMode('never');

  tray.on('click', function(event) {
    window.webContents.send('window-opened');

    toggleWindow();
  });

  tray.on('double-click', function(event) {
    toggleWindow();

    if (window.isVisible()) {
      window.webContents.send('window-opened');
    }
  });

  tray.on('right-click', function(event) {
    // window.openDevTools({mode: 'detach'});
    app.quit();
  });

  // Make the popup window for the menubar
  window = new BrowserWindow({
    width: 300,
    height: 450,
    show: false,
    frame: false,
    resizable: false,
  });

  window.setVisibleOnAllWorkspaces(true);

  // Tell the popup window to load our index.html file
  window.loadURL(`file://${path.join(__dirname, 'index.html')}`);

  // Only close the window on blur if dev tools isn't opened
  window.on('blur', () => {
    if(!window.webContents.isDevToolsOpened()) {
      window.hide();
    }
  });
});

const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide();
  } else {
    showWindow();
  }
}

const showWindow = () => {
  const trayPos = tray.getBounds();
  const windowPos = window.getBounds();
  let x, y = 0;
  if (process.platform == 'darwin') {
    x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2));
    y = Math.round(trayPos.y + trayPos.height);
  } else {
    x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2));
    y = Math.round(trayPos.y + trayPos.height * 10);
  }


  window.setPosition(x, y, false);
  window.show();
  window.focus();
}

ipcMain.on('show-window', () => {
  showWindow();
});

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});