import * as React from 'react';
import { translate } from 'react-i18next';
import * as os from 'os';
import { exec } from 'child_process';
import notice from 'utils/notice';
import * as api from 'utils/api';
import {LocalSettings} from 'typings/settings';
import {remote} from 'electron';
const {dialog} = remote;
const {app} = remote;
import * as path from 'path';

interface IProps {
    t?: any;
    exportControllerLogsToFile(evt:any): void;
}

@translate('logs/logsList')

export default class ExportBtns extends React.Component<IProps, any> {

    archiveName = 'dump.zip';
    detectedOS = null;

    constructor(props: IProps) {
        super(props);

        this.state = {
            settings: null,
            disabledBtn: false
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
        this.detectedOS = os.platform();

        if (!this.detectedOS || this.detectedOS === null || typeof this.detectedOS === 'undefined') {
            const {t} = this.props;
            notice({level: 'warning', msg: t('OSNotDetected')});
            return;
        }

        this.setState({disabledBtn: true});

        switch (this.detectedOS) {
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
        const util = path.join(settings.collectLogsPath.linux, 'dump_ubuntu.py');
        const archive = path.join(settings.collectLogsPath.linux, this.archiveName);

        exec(`sudo python ${util} ${archive}`, () => {
            this.saveDialogHandler(archive);
        });
    }

    saveWindowsLogs() {
        const utilPath = path.join(process.cwd(), '\\..\\util\\dump\\');
        const archivePath = path.join(process.cwd(), '\\..');
        const archiveName = 'dump_' + Date.now() + '.zip';
        const archive = path.join(archivePath, '\\dump\\', archiveName);

        exec(`"${utilPath}ps-runner.exe" -script "${utilPath}new-dump.ps1" -installDir "${archivePath}" -outFile "${archive}"`, () => {
            this.saveDialogHandler(archive, archiveName);
        });
    }

    saveMacOSLogs() {
        const appPath = app.getAppPath();
        const utilPath = path.join(appPath, '/../../../../../util/dump/');
        const util = path.join(utilPath, 'dump_mac.sh');
        const archivePath = path.join(appPath, '/../../../../../../');

        exec(`${util} ${archivePath}`, () => {
            this.saveDialogHandler(archivePath + this.archiveName);
        });
    }

    saveDialogHandler(archive: string, archiveName: string = null) {
        const {t} = this.props;
        archiveName = archiveName ? archiveName : this.archiveName;

        (dialog.showSaveDialog as any)(null, {
            title: t('SavingAllLogs'),
            defaultPath: archiveName,
            filters: [{
                name: 'zip',
                extensions: ['zip']
            }]
        }, (pathToArchive: string) => {
            if (pathToArchive !== null && typeof pathToArchive !== 'undefined') {
                api.fs.copyFile(archive, pathToArchive)
                    .then(res => {
                        if (res.err) {
                            if (res.err.code === 'EACCES') {
                                notice({level: 'error', msg: t('PermissionDenied')});
                            } else {
                                notice({level: 'error', msg: t('UnknownError')});
                            }
                        } else {
                            notice({level: 'info', msg: t('LogsDownloaded')});
                            api.fs.removeFile(archive);
                        }
                    });
            } else {
                api.fs.removeFile(archive);
            }

            this.setState({disabledBtn: false});
        });
    }

    render() {
        const {t} = this.props;

        return (
            <div>
                <button className='btn btn-default btn-custom waves-effect waves-light m-b-30 m-r-20'
                    onClick={this.props.exportControllerLogsToFile}>{t('ExportControllerLogsBtn')}</button>

                <button className='btn btn-default btn-custom waves-effect waves-light m-b-30'
                    onClick={this.exportAllLogsToFile}
                    disabled={this.state.disabledBtn}>{t('ExportAllLogsBtn')}</button>
            </div>
        );
    }
}
