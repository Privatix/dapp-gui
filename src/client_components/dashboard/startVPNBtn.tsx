import * as React from 'react';
import { withRouter } from 'react-router-dom';
import * as api from '../../utils/api';
import { translate } from 'react-i18next';

@translate('client/dashboard/start')

class StartVPN extends React.Component <any,any> {

    constructor(props:any) {
        super(props);
    }

    componentDidMount() {
        this.getNotTerminatedConnections();
    }

    async getNotTerminatedConnections() {
        const pendingChannelsReq = api.channels.getClientList(null, 'pending');
        const activeChannelsReq = api.channels.getClientList(null, 'active');
        const suspendedChannelsReq = api.channels.getClientList(null, 'suspended');
        const [pendingChannels, activeChannels, suspendedChannels] = await Promise.all([pendingChannelsReq, activeChannelsReq, suspendedChannelsReq]);

        if((activeChannels as any).length > 0
            || (suspendedChannels as any).length > 0
            || (pendingChannels as any).length > 0) {
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

export default withRouter(StartVPN);
