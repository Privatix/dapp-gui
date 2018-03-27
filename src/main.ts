declare module 'path';

import {app, ipcMain, BrowserWindow} from 'electron';
import * as path from 'path';
import * as url from 'url';
import fetch from 'node-fetch';

const api = 'http://localhost:3000';

const catchEndpoints = [
    '/publishSO'
   ,'/templates'
];

// MOCK!!!
const template1 = {
    'schema': {
      'title': 'VPN Service Offering',
      'type': 'object',
      'required': [
          'templateVersion'
         ,'agentPublicKey'
         , 'serviceName'
         ,'country'
         ,'serviceSupply'
         ,'serviceUnit'
         ,'unitPrice'
         ,'minUnits'
         ,'billingInterval'
         ,'maxBillingUnitLag'
         ,'maxInactiveTime'
         ,'freeIntervals'
         ,'protocol'
      ],
      'properties': {
        'templateVersion': {'type': 'string', 'default': '1'},
        'agentPublicKey': {'type': 'string', 'title': 'public key'},
        'serviceName': {'type': 'string', 'title': 'Name of service (e.g. VPN)'},
        'country': {'type': 'string', 'title': 'country'},
        'serviceSupply': {'type': 'number', 'title': 'service supply'},
        'serviceUnit': {'type': 'number', 'title': 'service unit'},
        'unitPrice': {'type': 'number', 'title': 'unit price'},
        'minUnits': {'type': 'number', 'title': 'min units'},
        'maxUnits': {'type': 'number', 'title': 'max units'},
        'billingInterval': {'type': 'number', 'title': 'billing interval'},
        'maxBillingUnitLag': {'type': 'number', 'title': 'max billing unit lag'},
        'maxInactiveTime': {'type': 'number', 'title': 'max inactive time'},
        'freeIntervals': {'type': 'number', 'title': 'free intervals'},
        'minDownloadMbps': {'type': 'number', 'title': 'min download Mbps'},
        'minUploadMbps': {'type': 'number', 'title': 'min upload Mbps'},
        'protocol': {'type': 'string', 'enum': ['TCP', 'UDP'],' enumNames': ['TCP', 'UDP'], 'title': 'protocol'}
      }
    },
    'uiSchema': {
        'templateVersion': {'ui:widget': 'hidden'},
        'agentPublicKey': {'ui:widget': 'textarea', 'ui:help': 'enter your public key'},
        'serviceName': {},
        'country': {'ui:help': 'Country of service endpoint in ISO 3166-1 alpha-2 format.'},
        'serviceSupply': {'ui:help': 'Maximum supply of services according to service offerings. It represents maximum number of clients that can consume this service offering concurrently.'},
        'serviceUnit': {'ui:help': 'MB/Minutes'},
        'unitPrice': {'ui:help': 'PRIX that must be paid for unit_of_service'},
        'minUnits': {'ui:help': 'Used to calculate minimum deposit required'},
        'maxUnits': {'ui:help': 'Used to specify maximum units of service that will be supplied. Can be empty.'},
        'billingInterval': {'ui:help': 'Specified in unit_of_service. Represent, how often Client MUST provide payment approval to Agent.'},
        'maxBillingUnitLag': {'ui:help': 'Maximum payment lag in units after, which Agent will suspend service usage.'},
        'maxInactiveTime': {'ui:help': 'Maximum time without service usage. Agent will consider, that Client will not use service and stop providing it. Period is specified in minutes.'},
        'freeIntervals': {'ui:help': 'Used to give free trial, by specifying how many intervals can be consumed without payment'},
        'minDownloadMbps': {'ui:help': 'Minimum expected download speed (Mbps).Can be empty.'},
        'minUploadMbps': {'ui:help': 'Minimum expected upload speed (Mbps). Can be empty.'},
        'protocol': {'ui:help': 'Protocol: TCP or UDP'}
    }
  };

  const template2 = {
    'schema': {
      'title': 'yet another template',
      'type': 'object',
      'required': [
          'templateVersion'
         ,'agentPublicKey'
         , 'serviceName'
         ,'country'
      ],
      'properties': {
        'templateVersion': {'type': 'string', 'default': '1'},
        'agentPublicKey': {'type': 'string', 'title': 'public key'},
        'serviceName': {'type': 'string', 'title': 'Name of service (e.g. VPN)'},
        'country': {'type': 'string', 'title': 'country'}
      }
    },
    'uiSchema': {
        'templateVersion': {'ui:widget': 'hidden'},
        'agentPublicKey': {'ui:widget': 'textarea', 'ui:help': 'enter your public key'},
        'serviceName': {},
        'country': {'ui:widget': 'textarea', 'ui:help': 'Country of service endpoint in ISO 3166-1 alpha-2 format.'}
    }
  };

  ipcMain.on('api', (event, msg) => {
    const req = JSON.parse(msg);
    if(/\/templates/.test(req.endpoint) && req.options.method === 'GET') {
        event.sender.send('api-reply', JSON.stringify({req: msg, res: [template1, template2]}));
    }else if(/\/offerings\?/.test(req.endpoint)) {
        event.sender.send('api-reply', JSON.stringify({req: msg, res: [{title: 'second offering', id: 2}, {title: 'third offering', id: 3}]}));
    }else if(/\/offerings\/\d+\/status/.test(req.endpoint)) {
        event.sender.send('api-reply', JSON.stringify({req: msg, res: {code: 200, status: 'OK!'}}));
    }else if(/\/offerings/.test(req.endpoint)) {
        event.sender.send('api-reply', JSON.stringify({req: msg, res: [{title: 'first offering', id: 1}, {title: 'second offering', id: 2}, {title: 'third offering', id: 3}]}));
    }else if(/\/channels\/\d+\/status/.test(req.endpoint)) {
        event.sender.send('api-reply', JSON.stringify({req: msg, res: {code: 200, status: 'channel OK!'}}));
    }else if(/\/products\/\d+\/status/.test(req.endpoint)) {
        event.sender.send('api-reply', JSON.stringify({req: msg, res: {code: 200, status: 'service OK!'}}));
    }else if(/\/products/.test(req.endpoint)) {
        event.sender.send('api-reply', JSON.stringify({req: msg, res: [{title: 'first product', id: 1}, {title: 'second product', id: 2}, {title: 'third product', id: 3}]}));
    }else if(req.endpoint.includes('/settings') && req.options.method === 'GET') {
        console.log('options!!!', req);
        event.sender.send('api-reply', JSON.stringify({req: msg, res: [{name: 'option1', value: 'some value', desc: 'some desc'}, {name: 'option2', value: 'some value', desc: 'some desc'}, {name: 'option3', value: 'some value', desc: 'some desc'}]}));
    } else if(/\/channels\?/.test(req.endpoint) && req.options.method === 'GET') {
        console.log('channels!!!', req);
        event.sender.send('api-reply', JSON.stringify({req: msg, res: [{title: 'second channel', id: 2}, {title: 'third channel', id: 3}]}));
    }else if(/\/channels/.test(req.endpoint) && req.options.method === 'GET') {
        console.log('channels!!!', req);
        event.sender.send('api-reply', JSON.stringify({req: msg, res: [{title: 'first channel', id: 1}, {title: 'second channel', id: 2}, {title: 'third channel', id: 3}]}));
    }else if(req.endpoint.includes('/sessions') && req.options.method === 'GET') {
        console.log('sessions!!!', req);
        event.sender.send('api-reply', JSON.stringify({req: msg, res: [{title: 'first session', id: 1}, {title: 'second session', id: 2}, {title: 'third session', id: 3}]}));
    }else if(catchEndpoints.includes(req.endpoint)){
        console.log(req);
        event.sender.send('api-reply', JSON.stringify({req: msg, res: {}}));
    }else {
        console.log(req);
        fetch(`${api}${req.endpoint}`, req.options)
            .then(res => res.json())
            .then(json => event.sender.send('api-reply', JSON.stringify({req: msg, res: json})));
    }
  });

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win:BrowserWindow = null;

function createWindow () {
  // Create the browser window.
  console.log(path.join(__dirname, 'icon_64.png'));
  win = new BrowserWindow({
      width: 800
     ,height: 600
     ,icon: path.join(__dirname, 'icon_64.png')
  });

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
// win.webContents.openDevTools();

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
