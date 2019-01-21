import * as React from 'react';
import { translate } from 'react-i18next';
import * as os from 'os';
import { exec } from 'child_process';
import notice from 'utils/notice';
import * as api from 'utils/api';
import {LocalSettings} from 'typings/settings';
import {remote} from 'electron';
const {dialog} = remote;

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
                console.log('Windows');
                break;
            case 'darwin':
                console.log('MacOS');
                break;
        }
    }

    saveUbuntuLogs() {
        const settings = this.state.settings;

        exec(`python ${settings.collectLogsPath.utils.linux}dump_ubuntu.py`, (error, stdout, stderr) => {
            const dates = stdout.match(/(\d{2}-\d{2}-\d{2}\s\d{2}-\d{2}-\d{2})/);
            const archiveName = `${dates[0]}.zip`;

            (dialog.showSaveDialog as any)(null, {
                title: 'Saving all logs',
                defaultPath: archiveName
            }, (pathToArchive: string) => {
                if (pathToArchive !== null && typeof pathToArchive !== 'undefined') {
                    api.fs.moveFile(`${settings.collectLogsPath.archives.linux}${archiveName}`, pathToArchive);
                } else {
                    console.log('Need to remove file');
                }
            });
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
