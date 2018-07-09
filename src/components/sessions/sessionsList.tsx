import * as React from 'react';
import {remote} from 'electron';
const {dialog} = remote;
import {fetch} from '../../utils/fetch';
import SessionItem from './sessionItem';
import toFixed8 from '../../utils/toFixed8';

export default class Sessions extends React.Component <any,any> {

    constructor(props:any) {
        super(props);

        this.state = {
            sessions: [],
            usage: 0,
            income: 0,
            sessionsDOM: ''
        };
    }

    async componentDidMount() {

        const endpoint = '/sessions' + (this.props.channel === 'all' ? '' : `?channelId=${this.props.channel}`);
        const sessions = await fetch(endpoint, {method: 'GET'});

        const usage = (sessions as any).reduce((usage, session) => {
            return usage + session.unitsUsed;
        }, 0);

        const offeringsArr = (sessions as any).map((session) => {
            return (fetch(`/channels?id=${session.channel}`)).then((channels:any) => fetch(`/offerings?id=${channels[0].offering}`));
        });
        const offerings = await Promise.all(offeringsArr);

        (sessions as any).forEach((session, i, sessions) => {
            sessions[i] = Object.assign({}, {'unitPrice': (offerings[i][0] as any).unitPrice}, session);
        });

        const income = (sessions as any).reduce((income, session) => {
            return income + session.unitsUsed * session.unitPrice;
            // const sessionIncome = await fetch(`/income?channel=${session.channel}`);
            // return income + sessionIncome;
        }, 0);

        const sessionsDOM = (sessions as any).map((session: any) => <SessionItem session={session}/>);

        this.setState({sessions, usage, income, sessionsDOM});
    }

    exportToFile() {
        (dialog.showSaveDialog as any)(null, {
            title: 'saving sessions',
            defaultPath: 'sessions.csv'
        }, (fileName: string) => {
            if (fileName != null) {
                const headers = ['session id', 'channel id', 'started', 'stopped', 'units used', 'client IP', 'client port'];
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
        return <div className='container-fluid'>

            <div className='row'>
                <div className='col-sm-12 col-xs-12'>
                    <div className='card m-b-20'>
                        <h5 className='card-header'>Total Statistics</h5>
                        <div className='col-md-4 col-sm-12 col-xs-12 p-0'>
                            <div className='card-body'>
                                <table className='table table-striped'>
                                    <tbody>
                                    <tr>
                                        <td>Total usage:</td>
                                        <td>{(this.state.usage / 1024).toFixed(3)} Gb</td>
                                    </tr>
                                    <tr>
                                        <td>Total income:</td>
                                        <td>{toFixed8({number: this.state.income / 1e8})} PRIX</td>
                                    </tr>
                                    <tr>
                                        <td>Sessions count:</td>
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
                        <h5 className='card-header'>Detailed Statistics</h5>
                        <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                            <div className='card-body'>
                                <button className='btn btn-default btn-custom waves-effect waves-light m-b-20'
                                        onClick={this.exportToFile.bind(this)}>Export to a file
                                </button>
                                <table className='table table-bordered table-striped'>
                                    <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Started</th>
                                        <th>Stopped</th>
                                        <th>Usage</th>
                                        <th>Last Usage Time</th>
                                        <th>Client Ip</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {this.state.sessionsDOM}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}
