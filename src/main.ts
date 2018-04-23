declare module 'path';

import {app, ipcMain, BrowserWindow} from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';
import fetch from 'node-fetch';
import mocks from './mocks';
import * as  btoa from 'btoa';

const settings = JSON.parse(fs.readFileSync(`${__dirname}/settings.json`, {encoding: 'utf8'}));
var password = '';

  if(process.env.TARGET && process.env.TARGET === 'test'){
      app.disableHardwareAcceleration();
  }
// const api = 'http://localhost:3000/ui';

  ipcMain.on('api', (event, msg) => {
    const req = JSON.parse(msg);
    if(!req.options.method){
        req.options.method = 'get';
    }

// MOCK!!!
    if(mocks.has(req)){
        const res = mocks.get(req);
        event.sender.send('api-reply', JSON.stringify({req: msg, res}));
    }else if(req.endpoint === '/isItFirstStart'){
        event.sender.send('api-reply', JSON.stringify({req: msg, res: settings.firstStart}));
    }else if(req.endpoint === '/isAuthorized'){
        console.log('isAuthorized', password !== '');
        event.sender.send('api-reply', JSON.stringify({req: msg, res: password !== ''}));
    } else if(req.endpoint === '/login'){
        console.log('login!!!', req.options.body.pwd);
        password = req.options.body.pwd;
        event.sender.send('api-reply', JSON.stringify({req: msg, res: true}));
    }else if(req.endpoint === '/accounts' && req.options.method === 'post'){
        req.options.body = JSON.stringify(req.options.body);
        /*
        fetch(`${settings.apiEndpoint}${req.endpoint}`, req.options)
            .then(res => {
                console.log('accounts!!!', res);
                return res.json();
            })
            .then(json => {
           */
           const json = true;
                  console.log('accounts!!!', json);
                  settings.firstStart = false;
                  fs.writeFileSync(`${__dirname}/settings.json`, JSON.stringify(settings, null, 4));
                  event.sender.send('api-reply', JSON.stringify({req: msg, res: json}));
            // });
    }else {
        if(/\/templates/.test(req.endpoint) && req.options.method === 'post') { // DO NOT REMOVE!!! 
            // console.log(req);
            if(req.options.body.path){
                // get file content
                req.options.body = {
                    raw: btoa(fs.readFileSync(req.options.body.path, {encoding: 'utf8'})),
                    kind: req.options.body.kind
                };
            }
        }
        console.log(req);
        req.options.body = JSON.stringify(req.options.body);
        fetch(`${settings.apiEndpoint}${req.endpoint}`, req.options)
            .then(res => {
                console.log('RESPONSE!!!', res);
                return res.json();
            })
            .then(json => {
                  console.log('RESPONSE!!!', json);
                  event.sender.send('api-reply', JSON.stringify({req: msg, res: json}));
            });
    }
  });

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win:BrowserWindow = null;

function createWindow () {
  // Create the browser window.
  console.log(path.join(__dirname, 'icon_64.png'));
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
