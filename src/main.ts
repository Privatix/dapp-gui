declare module 'path';

import {app, ipcMain, BrowserWindow} from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';

import { updateChecker } from './updateChecker';

let win:BrowserWindow = null;
let settings = JSON.parse(fs.readFileSync(`${__dirname}/settings.json`, {encoding: 'utf8'}));

  const announce = function(announcement: any){
      settings = Object.assign({}, settings, {'releases': Object.assign({}, settings.releases, announcement)});
      fs.writeFileSync(`${__dirname}/settings.json`, JSON.stringify(settings, null, 4));
      win.webContents.send('localSettings', settings);
  };

  if(process.env.TARGET && process.env.TARGET === 'test'){
      app.disableHardwareAcceleration();
  }

  ipcMain.on('api', (event, msg) => {
    const req = JSON.parse(msg);
    if(!req.options){
        req.options = {};
    }
    if(!req.options.method){
        req.options.method = 'get';
    }

    if(req.endpoint === '/readFile'){
        const file = fs.readFileSync(req.options.body.fileName, {encoding: 'utf8'});
        event.sender.send('api-reply', JSON.stringify({req: msg, res: file}));
    }else if(req.endpoint === '/saveAs'){
        fs.writeFile(req.options.body.fileName, req.options.body.data, {encoding: 'utf8'}, (err:any) => {
            event.sender.send('api-reply', JSON.stringify({req: msg, res: {err}}));
        });
    }else if(req.endpoint === '/localSettings'){
        event.sender.send('api-reply', JSON.stringify({req: msg, res: settings}));
    }
  });

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

function createWindow () {
  // Create the browser window.
  let options = {
          width: 800
         ,height: 600
         ,icon: path.join(__dirname, 'icon_64.png')
      };
  win = new BrowserWindow(options);



  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  if (process.env.TARGET === 'dev') {
      win.webContents.openDevTools();
  }
  win.maximize();

    // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
    app.quit();
  });

  win.webContents.on('dom-ready', () => {
      win.webContents.send('localSettings', settings);
      updateChecker.start(settings, announce);
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
