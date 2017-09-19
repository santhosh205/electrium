const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;

// SET ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', () => {
  // Create new Window
  mainWindow = new BrowserWindow({});
  // Load html into Window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes: true
  }));
  // Quit App when closed
  mainWindow.on('closed', () => {
    app.quit();
  });
  // Build Menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);
});

function createAddWindow () {
  // Create new Window
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add List Item'
  });
  // Load html into Window
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes: true
  }));
  // Clear memory on close
  addWindow.on('close', () => {
    addWindow = null;
  });
  // Removing Menu
  addWindow.setMenu(null);
}

// Catch item:add
ipcMain.on('item:add', (e, item) => {
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
});

// Create Menu template
const mainMenuTemplate = [{
  label: 'File',
  submenu: [
    {
      label: 'Add Item',
      click () {
        createAddWindow();
      }
    },
    {
      label: 'Clear Items',
      click () {
        mainWindow.webContents.send('items:clear');
      }
    },
    {
      label: 'Quit',
      accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
      click () {
        app.quit();
      }
    }
  ]
}];

// Configuring Menu for Mac
if (process.platform === 'darwin') {
  mainMenuTemplate.unshift({});
}

// Configuring Developer Tools in Menu
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: process.platform === 'darwin' ? 'Command+I' : 'Ctrl+I',
        click (item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  });
}
