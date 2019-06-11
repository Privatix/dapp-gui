import * as React from 'react';
import { translate } from 'react-i18next';
import * as os from 'os';
import { exec } from 'child_process';
import notice from 'utils/notice';
import * as api from 'utils/api';
import {remote} from 'electron';
const {dialog} = remote;
const {app} = remote;
import * as path from 'path';
import {connect} from 'react-redux';
import {State} from '../../../typings/state';
import {LocalSettings} from '../../../typings/settings';

interface IProps {
    t?: any;
    localSettings?: LocalSettings;
    exportControllerLogsToFile(evt:any): void;
}

interface IState {
    disabledBtn: boolean;
}

@translate('logs/logsList')

class ExportBtns extends React.Component<IProps, IState> {

    archiveName = 'dump.zip';
    detectedOS = null;

    constructor(props: IProps) {
        super(props);

        this.state = {
            disabledBtn: false
        };
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
        const appPath = app.getAppPath();
        const utilPath = path.join(appPath, '../../../util/dump/');
        const util = path.join(utilPath, 'dump_ubuntu.sh');
        const archivePath = path.join(appPath, '../../../../');

        exec(`sudo ${util} ${archivePath}`, () => {
            this.saveDialogHandler(archivePath + 'dump.tar.gz', 'dump.tar.gz');
        });
    }

    saveWindowsLogs() {
        const utilPath = path.join(process.execPath, '\\..\\util\\dump\\');
        const archivePath = path.join(process.execPath, '\\..');
        const archiveName = 'dump_' + Date.now() + '.zip';
        const archive = path.join(archivePath, '\\util\\dump\\', archiveName);

        console.log('exec:', `"${utilPath}ps-runner.exe" -script "${utilPath}new-dump.ps1" -installDir "${archivePath}" -outFile "${archive}"`);
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
                name: this.detectedOS === 'linux' ? 'tar.gz' : 'zip',
                extensions: ['zip', 'tar.gz']
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

export default connect( (state: State) => ({localSettings: state.localSettings}) )(ExportBtns);
