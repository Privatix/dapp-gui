import { fetch } from './fetch';
import { ipcRenderer } from 'electron';

import * as Settings from './api/settings';
export const settings = Settings;

export const on = ipcRenderer.on.bind(ipcRenderer);

import * as FS from './api/fs';
export const fs = FS;

import * as App from './api/app';
export const app = App;

export const exec = function(cmd: string): Promise<{error: any, stdout: any, stderr: any}>{
    return fetch('/exec', {body: {cmd}}) as Promise<{error: any, stdout: any, stderr: any}>;
};

export const exit = function(): Promise<{}>{
    return fetch('/exit', {}) as Promise<{}>;
};

export const smartExit = function(status: boolean): Promise<{}>{
    return fetch('/smartExit', {body: {status}}) as Promise<{}>;
};
