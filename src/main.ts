declare module 'path';

import {app, ipcMain, BrowserWindow} from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';
import fetch from 'node-fetch';
import mocks from './mocks';
import * as  btoa from 'btoa';
import * as keythereum from 'keythereum';

let settings = JSON.parse(fs.readFileSync(`${__dirname}/settings.json`, {encoding: 'utf8'}));
let password = '';

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

// MOCK!!!
    if(mocks.has(req)){
        const res = mocks.get(req);
        event.sender.send('api-reply', JSON.stringify({req: msg, res}));
    }else if(req.endpoint === '/auth' && req.options.method === 'post' ){
        // password = req.options.body.password;
        const pwd = req.options.body.password;
        req.options.body = JSON.stringify(req.options.body);
        fetch(`${settings.apiEndpoint}${req.endpoint}`, req.options)
            .then(res => {
                // console.log('auth!!!', res, res.status);
                if(res.status === 201){
                    password = pwd;
                    event.sender.send('api-reply', JSON.stringify({req: msg, res: {}}));
                }else {
                    // TODO error handling
                }
            });
    }else if(req.endpoint === '/backup'){
        console.log('BACKUP!!!', req.options.body);

        const pk = JSON.parse(req.options.body.pk);
        console.log(pk);
        const keyObject = keythereum.dump(password, Buffer.from(pk.privateKey.data), Buffer.from(pk.salt.data), Buffer.from(pk.iv.data));
        fs.writeFile(req.options.body.fileName, JSON.stringify(keyObject), {encoding: 'utf8'}, (err:any) => {
            // TODO handling
        });
        event.sender.send('api-reply', JSON.stringify({req: msg, res: {}}));
    }else if(req.endpoint === '/readFile'){
        const file = fs.readFileSync(req.options.body.fileName, {encoding: 'utf8'});
        // const privateKey = keythereum.recover(req.options.body.pwd, keyObject);
        // console.log(privateKey);
        event.sender.send('api-reply', JSON.stringify({req: msg, res: {file}}));
    }else if(req.endpoint === '/saveAs'){
        console.log('SAVE AS!!!', req.options.body);
        fs.writeFile(req.options.body.fileName, req.options.body.data, {encoding: 'utf8'}, (err:any) => {
            // TODO handling
        });
    }else if(req.endpoint === '/localSettings'){
        if (req.options.method === 'get'){
            event.sender.send('api-reply', JSON.stringify({req: msg, res: settings}));
        }else{
            settings = req.options.body;
            fs.writeFileSync(`${__dirname}/settings.json`, JSON.stringify(settings, null, 4));
            event.sender.send('api-reply', JSON.stringify({req: msg, res: {}}));
        }
    }else if(req.endpoint === '/login'){
        console.log('login!!!', req.options.body.pwd);
        password = req.options.body.pwd;
        const options = {method: 'get'} as any;
        options.headers = {};
        options.headers.Authorization = 'Basic ' + Buffer.from(`username:${password}`).toString('base64');
        fetch(`${settings.apiEndpoint}/products`, options)
            .then(res => {
                event.sender.send('api-reply', JSON.stringify({req: msg, res: res.status === 200}));
            });
    }else if(req.endpoint === '/switchMode'){
        settings.mode = settings.mode === 'agent' ? 'client' : 'agent';
        fs.writeFileSync(`${__dirname}/settings.json`, JSON.stringify(settings, null, 4));
        event.sender.send('api-reply', JSON.stringify({req: msg, res: {}}));
    }else if(req.endpoint === '/accounts' && req.options.method === 'post'){
        req.options.body = JSON.stringify(req.options.body);
        console.log('SET ACCOUNT!!!', req.options.body, password);
        req.options.headers = {};
        req.options.headers.Authorization = 'Basic ' + Buffer.from(`username:${password}`).toString('base64');

        fetch(`${settings.apiEndpoint}${req.endpoint}`, req.options)
            .then(res => {
                console.log('accounts!!!', res);
                return res.json();
            })
            .then(json => {
           
                  // const json = true;
                  console.log('accounts!!!', json);
                  if(settings.firstStart){
                      settings.firstStart = false;
                      fs.writeFileSync(`${__dirname}/settings.json`, JSON.stringify(settings, null, 4));
                  }
                  event.sender.send('api-reply', JSON.stringify({req: msg, res: json}));
           });
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
        req.options.body = JSON.stringify(req.options.body);
        if(!req.options.headers){
            req.options.headers = {};
        }
        req.options.headers.Authorization = 'Basic ' + Buffer.from(`username:${password}`).toString('base64');
        fetch(`${settings.apiEndpoint}${req.endpoint}`, req.options)
            .then(res => {
                // console.log(req.endpoint, res.headers.get('content-type'));
                // const contentType = res.headers.get('content-type');
                return res.json()
                    .then(((res) =>  res), () => { return {}; });
                // return  (contentType !== null && contentType.includes('application/json')) || res.status === 201 ? res.json() : {};
            })
            .then(json => {
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
