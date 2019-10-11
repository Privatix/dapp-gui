import * as React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import {remote} from 'electron';
const {dialog} = remote;

import * as api from 'utils/api';
import Prix from 'common/badges/PRIX';
import MB from 'common/badges/MB';

import SessionsTable from './sessionsTable';

import { State } from 'typings/state';

const translate = withTranslation(['sessions/sessionsList']);

class Sessions extends React.Component <any,any> {

    constructor(props:any) {
        super(props);

        this.state = {
            sessions: [],
            usage: 0,
            sessionsData: []
        };
    }

    async componentDidMount() {
        const { ws, channel } = this.props;
        const sessions = await ws.getSessions(channel === 'all' ? '' : channel);

        const usage = sessions.reduce((usage, session) => {
            return usage + session.unitsUsed;
        }, 0);

        const sessionsData = sessions.map((session: any) => {
            return {
                id: session.id,
                started: session.started,
                stopped: session.stopped,
                usage: session.unitsUsed,
                lastUsedTime: session.lastUsageTime,
                clientIP: session.clientIP
            };
        });

        this.setState({sessions, usage, sessionsData});
    }

    exportToFile = () => {

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
                api.fs.saveAs(fileName, data.map(row => row.join()).join('\n'));
            }
        });
    }

    render() {

        const { t, income } = this.props;
        const { usage, sessions, sessionsData } = this.state;

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
                                        <td><MB amount={usage} /></td>
                                    </tr>
                                    <tr key='income'>
                                        <td>{t('TotalIncome')}:</td>
                                        <td><Prix amount={income} /> PRIX</td>
                                    </tr>
                                    <tr key='sessionsCount'>
                                        <td>{t('SessionsCount')}:</td>
                                        <td>{sessions.length}</td>
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
                                        onClick={this.exportToFile}>{t('ExportToAFile')}
                                </button>

                                <SessionsTable data={sessionsData} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default connect((state: State) => ({income: state.totalIncome, ws: state.ws}))(translate(Sessions));
