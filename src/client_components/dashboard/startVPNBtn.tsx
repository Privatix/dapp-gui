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

    async getNotTerminatedConnections() {

        const { ws } = this.props;

        const pendingChannelsReq = ws.getClientChannels('', 'pending', 0, 10);
        const activeChannelsReq = ws.getClientChannels('active', 'active', 0, 10);
        const suspendedChannelsReq = ws.getClientChannels('active', 'suspended', 0, 10);

        const [pendingChannels, activeChannels, suspendedChannels] = await Promise.all([pendingChannelsReq, activeChannelsReq, suspendedChannelsReq]);

        if(activeChannels.items.length + suspendedChannels.items.length + pendingChannels.items.length > 0) {
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
