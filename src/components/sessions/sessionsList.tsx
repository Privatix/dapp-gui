import * as React from 'react';
import {remote} from 'electron';
const {dialog} = remote;
import { translate } from 'react-i18next';

import {fetch} from '../../utils/fetch';
import toFixedN from '../../utils/toFixedN';
import * as api from '../../utils/api';
import SessionsTable from './sessionsTable';

@translate(['sessions/sessionsList'])

export default class Sessions extends React.Component <any,any> {

    subscription: String;

    constructor(props:any) {
        super(props);

        this.state = {
            sessions: [],
            usage: 0,
            income: 0,
            sessionsData: []
        };
    }

    async componentDidMount() {
        const sessions = await (window as any).ws.getSessions(this.props.channel === 'all' ? '' : this.props.channel);

        const usage = sessions.reduce((usage, session) => {
            return usage + session.unitsUsed;
        }, 0);

        const offeringsArr = sessions.map(session => {
            return (api.channels.getById(session.channel)).then((channels:any) => fetch(`/offerings?id=${channels[0].offering}`));
        });
        const offerings = await Promise.all(offeringsArr);

        (sessions as any).forEach((session, i, sessions) => {
            sessions[i] = Object.assign({}, {'unitPrice': (offerings[i][0] as any).unitPrice}, session);
        });

        const income = (sessions as any).reduce((income, session) => {
            return income + session.unitsUsed * session.unitPrice;
        }, 0);

        const sessionsData = (sessions as any).map((session: any) => {
            return {
                id: session.id,
                started: session.started,
                stopped: session.stopped,
                usage: session.unitsUsed + ' MB',
                lastUsageTime: session.lastUsageTime,
                clientIP: session.clientIP
            };
        });

        this.setState({sessions, usage, income, sessionsData});
    }

    exportToFile() {

        const { t } = this.props;

        (dialog.showSaveDialog as any)(null, {
            title: t('SavingSessions'),
            defaultPath: 'sessions.csv'
        }, (fileName: string) => {
            if (fileName != null) {
                const headers = [t('sessionId'), t('channelId'), t('Started'), t('Stopped'), t('Usage'), t('ClientIP'), t('ClientPort')];
                const data = (this.state.sessions as any).map(session => [session.id
                    , session.channel
                    , session.started
                    , session.stopped
                    , session.unitsUsed
                    , session.clientIP
                    , session.clientPort
                ]);
                data.unshift(headers);
                fetch('/saveAs', {body: {fileName, data: data.map(row => row.join()).join('\n')}});
            }
        });
    }

    render() {

        const { t } = this.props;

        return <div className='container-fluid'>

            <div className='row'>
                <div className='col-sm-12 col-xs-12'>
                    <div className='card m-b-20'>
                        <h5 className='card-header'>{t('TotalStatistics')}</h5>
                        <div className='col-md-4 col-sm-12 col-xs-12 p-0'>
                            <div className='card-body'>
                                <table className='table table-striped'>
                                    <tbody>
                                    <tr key='usage'>
                                        <td>{t('TotalUsage')}:</td>
                                        <td>{(this.state.usage / 1024).toFixed(3)} GB</td>
                                    </tr>
                                    <tr key='income'>
                                        <td>{t('TotalIncome')}:</td>
                                        <td>{toFixedN({number: this.state.income / 1e8, fixed: 8})} PRIX</td>
                                    </tr>
                                    <tr key='sessionsCount'>
                                        <td>{t('SessionsCount')}:</td>
                                        <td>{(this.state.sessions as any).length}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='row'>
                <div className='col-12'>
                    <div className='card m-b-20'>
                        <h5 className='card-header'>{t('DetailedStatistics')}</h5>
                        <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                            <div className='card-body'>
                                <button className='btn btn-default btn-custom waves-effect waves-light m-b-20'
                                        onClick={this.exportToFile.bind(this)}>{t('ExportToAFile')}
                                </button>

                                <SessionsTable data={this.state.sessionsData} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}
