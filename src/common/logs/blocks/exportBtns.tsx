import { exec } from 'child_process';
import * as os from 'os';
import * as path from 'path';

import * as log from 'electron-log';
import * as sudo from 'sudo-prompt';

import {remote} from 'electron';
const { dialog, app } = remote;

import * as React from 'react';
import {connect} from 'react-redux';
import { translate } from 'react-i18next';

import notice from 'utils/notice';
import * as api from 'utils/api';

import {State} from 'typings/state';
import {LocalSettings} from 'typings/settings';

interface IProps {
    t?: any;
    localSettings?: LocalSettings;

    exportControllerLogsToFile(evt: any): void;
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

    async saveUbuntuLogs() {
        const role = this.props.localSettings.role;
        const privatixApplicationFolder = path.join(app.getAppPath(), '../../../');
        const executeCommand = 'machinectl -q shell ' + role + ' /bin/sh -c \'/util/dump/dump_ubuntu.sh ../..\'';

        log.log(executeCommand);
        const {error} = await api.exec(executeCommand);

        if (error) {
            log.error(error);
        }
        this.saveDialogHandler(privatixApplicationFolder + 'dump.tar.gz', 'dump.tar.gz');
    }

    saveWindowsLogs() {
        const installDir = path.join(app.getAppPath(), '\\..\\..\\..');
        const utilPath = path.join(installDir, '\\util\\dump\\');
        const archiveName = 'dump_' + Date.now() + '.zip';
        const archive = path.join(app.getPath('temp'), archiveName);

        const cmd = `"${utilPath}ps-runner.exe" -script "${utilPath}new-dump.ps1" -installDir "${installDir}" -outFile "${archive}"`;
        log.log(cmd);
        exec(cmd, (error) => {
            if (error) {
                log.error(error);
            }
            this.saveDialogHandler(archive, archiveName);
        });
    }

    saveMacOSLogs() {
        const appPath = app.getAppPath();
        const utilPath = path.join(appPath, '/../../../../../util/dump/');
        const util = path.join(utilPath, 'dump_mac.sh');
        const archivePath = path.join(appPath, '/../../../../../../');

        log.log(`sudo ${util} ${archivePath}`);
        sudo.exec(util + ' ' + archivePath, {name: 'Privatix Network'},
            (error) => {
                if (error) {
                    log.error(error);
                }

                this.saveDialogHandler(archivePath + this.archiveName);
            }
        );
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
                            log.log(res.err);
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

export default connect((state: State) => ({localSettings: state.localSettings}))(ExportBtns);
