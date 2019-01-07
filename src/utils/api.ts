import {ipcRenderer} from 'electron';

import * as Settings from './api/settings';
export const settings = Settings;

export const on = ipcRenderer.on.bind(ipcRenderer);

import * as FS from './api/fs';
export const fs = FS;
