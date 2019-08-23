declare module 'path';

import {app, BrowserWindow, ipcMain} from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as sudo from 'sudo-prompt';

import {updateChecker} from './updateChecker';

let smartExit = false;
let win:BrowserWindow = null;
let settings = JSON.parse(fs.readFileSync(`${__dirname}/settings.json`, {encoding: 'utf8'}));
  settings.rootpath = __dirname;
  if (settings.log && settings.log.filePath){
    let userHome = app.getPath('home');
    settings.log.filePath = settings.log.filePath.replace(/(\~\/|\$HOME)/, userHome);
  }
  const announce = function(announcement: any){
      win.webContents.send('releases', announcement);
  };

  if(process.env.TARGET && process.env.TARGET === 'test'){
      app.disableHardwareAcceleration();
  }

  ipcMain.on('api', async (event, msg) => {
    const req = JSON.parse(msg);
    if(!req.options){
        req.options = {};
    }
    if(!req.options.method){
        req.options.method = 'get';
    }

    if(req.endpoint === '/exec'){
        const options = {
          name: 'Electron',
        };
        console.log(req.options.body.cmd);
        sudo.exec(req.options.body.cmd, options,
          function(error: any, stdout: any, stderr: any) {
            if(error){
                throw error;
            }
            console.log('stdout: ' + stdout);
            event.sender.send('api-reply', JSON.stringify({req: msg, res: {error, stdout, stderr}}));
          }
        );

    }else if(req.endpoint === '/readFile'){
        const file = fs.readFileSync(req.options.body.fileName, {encoding: 'utf8'});
        event.sender.send('api-reply', JSON.stringify({req: msg, res: file}));
    }else if(req.endpoint === '/saveAs'){
        fs.writeFile(req.options.body.fileName, req.options.body.data, {encoding: 'utf8'}, (err:any) => {
            event.sender.send('api-reply', JSON.stringify({req: msg, res: {err}}));
        });
    }else if(req.endpoint === '/copyFile'){
        fse.copy(req.options.src, req.options.dest, {overwrite: true}, (err:any) => {
            event.sender.send('api-reply', JSON.stringify({req: msg, res: {err}}));
        });
    }else if(req.endpoint === '/removeFile'){
        fs.unlink(req.options.src, (err:any) => {
            event.sender.send('api-reply', JSON.stringify({req: msg, res: {err}}));
        });
    }else if(req.endpoint === '/localSettings'){
        event.sender.send('api-reply', JSON.stringify({req: msg, res: settings}));
    }else if(req.endpoint === '/resizeWindow'){
        const { width, height } = req.options;
        win.setSize(width, height);
        event.sender.send('api-reply', JSON.stringify({req: msg, res: 'ok'}));
    }else if(req.endpoint === '/exit'){
        event.sender.send('api-reply', JSON.stringify({req: msg, res: 'ok'}));
        smartExit = false;
        win = null;
        app.quit();
    }else if(req.endpoint === '/smartExit'){
        event.sender.send('api-reply', JSON.stringify({req: msg, res: 'ok'}));
        smartExit = req.options.body.status;
    }
  });

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

function createWindow () {
  // Create the browser window.
  let options = {
          width: 600
         ,height: 800
         ,icon: path.join(__dirname, 'icon_64.png')
         ,webPreferences: {
              nodeIntegration: true
         }
      };
  win = new BrowserWindow(options);

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  win.on('close', function(e: any){
    if(smartExit){
        e.preventDefault();
        win.webContents.send('exit', {});
    }else{
        win = null;
        app.quit();
    }
  });

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

  return win;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
        win = createWindow();

        function log(text: any) {
            win.webContents.executeJavaScript('console.log(\'' + text + '\');')
                .then(_ => {
                    // empty
                });
        }

        if (process.platform === 'win32') {
            // replace "Program Files" by GUID
            // https://docs.microsoft.com/en-us/windows/win32/shell/knownfolderid
            //
            // Todo: @drew2a maybe better way is to get AppUserModelId by using something like
            //  get-StartApps | ? {$_.name -match "Privatix"}
            let appId = process.execPath.replace(new RegExp('^[\\w]:\\\\Program Files', 'gm'),
                '{6D809377-6AF0-444b-8957-A3773F02200E}');
            log('Set AppId: ' + JSON.stringify(appId));
            app.setAppUserModelId(appId);
        }
    }
);

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
