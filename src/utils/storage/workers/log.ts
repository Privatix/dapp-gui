import * as log from 'electron-log';
import { remote } from 'electron';
const { app } = remote;

import * as fs from 'fs';
import * as path from 'path';

const canReadAndWrite = (targetPath) => {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(targetPath)){
            fs.access(targetPath, fs.constants.W_OK | fs.constants.R_OK, (err) => {
                if (err) { reject(err); return; }
                resolve(true);
            });
        }else{
            const dir = path.dirname(targetPath);
            fs.access(dir, fs.constants.W_OK | fs.constants.R_OK, (err) => {
                if (err) { reject(err); return; }
                resolve(false);
            });
        }
    });
};

export default async (log: any, settings: any) => {
    log.transports.file.level = false;
    log.transports.console.level = false;
    log.transports.mainConsole.level = false;
    log.transports.remote.level = false;
    if (settings.log && settings.log.console){
        log.transports.console.level = settings.log.level as log.ILevelOption;
        log.transports.mainConsole.level = settings.log.level as log.ILevelOption;
    }
    if (settings.log && settings.log.file){
        const logpath = settings.target === 'win' ? `${app.getPath('appData')}${path.sep}Roaming${path.sep}Privatix`
                                                  : (!settings.log.filePath?settings.rootpath:settings.log.filePath);
        if (!fs.existsSync(logpath)){
            try {
                fs.mkdirSync(logpath, { recursive: true } as any);
            }catch(e){
                console.log('Can not write to dir'+logpath,e);
                return;
            }
        }
        const filePath = `${logpath}${path.sep}${settings.log.fileName}`;
        canReadAndWrite(filePath).then(()=> {
            log.transports.file.level = settings.log.level as log.ILevelOption;
            log.transports.file.file = filePath;
            if (settings.log.fileOverwrite && fs.existsSync(filePath)){
                log.transports.file.clear();
            }
        });
    }

    // catch and log unhandled errors/rejected promises:
    log.catchErrors({});
};
