import * as React from 'react';
import { translate } from 'react-i18next';
import * as os from 'os';
import { exec } from 'child_process';
import notice from 'utils/notice';
import * as api from 'utils/api';
import {LocalSettings} from 'typings/settings';
import {remote} from 'electron';
const {dialog} = remote;
import * as path from 'path';

interface IProps {
    t?: any;
    exportControllerLogsToFile(evt:any): void;
}

@translate('logs/logsList')

export default class ExportBtns extends React.Component<IProps, any> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            settings: null
        };
    }

    async getSettings() {
        const settings = (await api.settings.getLocal()) as LocalSettings;
        this.setState({settings});
    }

    componentDidMount() {
        this.getSettings();
    }

    exportAllLogsToFile = () => {
        const detectedOS = os.platform();

        if (!detectedOS || detectedOS === null || typeof detectedOS === 'undefined') {
            const {t} = this.props;
            notice({level: 'warning', msg: t('OSNotDetected')});
            return;
        }

        switch (detectedOS) {
            case 'linux':
                this.saveUbuntuLogs();
                break;
            case 'win32':
                this.saveWindowsLogs();
                break;
            case 'darwin':
                this.saveMacOSLogs();
                break;
        }
    }

    saveUbuntuLogs() {
        const settings = this.state.settings;
        const archiveName = 'dump.zip';
        const util = path.join(settings.collectLogsPath.linux, 'dump_ubuntu.py');
        const archive = path.join(settings.collectLogsPath.linux, archiveName);

        exec(`sudo python ${util} ${archive}`, (error, stdout, stderr) => {
            this.saveDialogHandler(archive, archiveName);
        });
    }

    saveWindowsLogs() {
        const utilPath = process.cwd() + '\\..\\util\\';
        const archivePath = process.cwd() + '\\..\\util\\dump\\';
        const archiveName = 'dump.zip';

        console.log('Dir', process.cwd());
        console.log('utilPath', utilPath);
        console.log('archivePath', archivePath);

        exec(`${utilPath}ps-runner.exe -script ${utilPath}new-dump.ps1 -installDir "${archivePath + archiveName}"`, (error, stdout, stderr) => {
            (dialog.showSaveDialog as any)(null, {
                title: 'Saving all logs',
                defaultPath: archiveName
            }, (pathToArchive: string) => {
                if (pathToArchive !== null && typeof pathToArchive !== 'undefined') {
                    api.fs.moveFile(`${archivePath}${archiveName}`, pathToArchive);
                } else {
                    api.fs.removeFile(`${archivePath}${archiveName}`);
                }
            });
        });
    }

    saveMacOSLogs() {
        const archiveName = 'dump.zip';
        const utilPath = path.join(process.cwd(), '/../../util/dump/');
        const util = path.join(utilPath, 'dump_mac.sh');
        const archive = path.join(utilPath, archiveName);

        console.log('Dir', process.cwd());
        console.log('utilPath', utilPath);
        console.log('util', util);
        console.log('archive', archive);

        exec(utilPath, (error, stdout, stderr) => {
            this.saveDialogHandler(archive, archiveName);
        });
    }

    saveDialogHandler(archive: string, archiveName: string) {
        (dialog.showSaveDialog as any)(null, {
            title: 'Saving all logs',
            defaultPath: archiveName
        }, (pathToArchive: string) => {
            if (pathToArchive !== null && typeof pathToArchive !== 'undefined') {
                api.fs.moveFile(archive, pathToArchive);
            } else {
                api.fs.removeFile(archive);
            }
        });
    }

    render() {
        const {t} = this.props;

        return (
            <div>
                <button className='btn btn-default btn-custom waves-effect waves-light m-b-30 m-r-20'
                    onClick={this.props.exportControllerLogsToFile}>{t('ExportControllerLogsBtn')}</button>

                <button className='btn btn-default btn-custom waves-effect waves-light m-b-30'
                    onClick={this.exportAllLogsToFile}>{t('ExportAllLogsBtn')}</button>
            </div>
        );
    }
}
