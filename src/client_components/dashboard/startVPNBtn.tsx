import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';

import { State } from '../../typings/state';

@translate('client/dashboard/start')

class StartVPN extends React.Component <any,any> {

    constructor(props:any) {
        super(props);
    }

    componentDidMount() {
        this.getNotTerminatedConnections();
    }

    async getAllClientChannels(){

        const { ws } = this.props;

        const statuses = [
            ['', 'pending'],
            ['', 'activating'],
            ['', 'active'],
            ['', 'suspending'],
            ['', 'suspended'],
            ['', 'terminating']
        ];
        const requests = statuses.map(status => ws.getClientChannels(status[0], status[1], 0, 10));
        const resolvedRequests = await Promise.all(requests);
        const channels = resolvedRequests.reduce((acc, cv) => cv.items.length ? acc.concat(cv.items) : acc, []);
        return channels;
    }

    async getNotTerminatedConnections() {

        const channels = await this.getAllClientChannels();

        if(channels.length) {
            this.props.history.push('/client-dashboard-connecting');
        }
    }

    startVPNBtnHandler(evt: any) {
        evt.preventDefault();
        this.props.history.push('/client-vpn-list');
    }

    render() {
        const { t } = this.props;

        return <div className='container-fluid'>
            <div className='row'>
                <div className='col-sm-12 m-t-20'>
                    <button type='button'
                            className='btn btn-default btn-custom btn-lg w-lg waves-effect waves-light'
                            onClick={this.startVPNBtnHandler.bind(this)}>
                        {t('StartUsingVPN')}
                    </button>
                </div>
            </div>
        </div>;
    }
}

export default connect((state: State) => ({ws: state.ws}))(withRouter(StartVPN));
