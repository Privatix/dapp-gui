import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';

import SortableTable from 'react-sortable-table-vilan';

import OfferingById from './offeringById';
import Connection from './connection';


import ModalWindow from 'common/modalWindow';

import { Id, Agent, Offering, ContractStatus, ServiceStatus, JobStatus, Usage, CostPRIX } from 'common/tables/';

import { ws, WS } from 'utils/ws';
import { ClientChannel, ClientChannelUsage } from 'typings/channels';

interface IProps {
    t?: any;
    ws?: WS;
    channels: ClientChannel[];
}
interface IState {
    popup: boolean;
    usage: {[key: string]: ClientChannelUsage};
}

@translate('client/connections/active')
class ActiveConnection extends React.Component<IProps, IState>{

    subscribeId = null;
    mounted = false;

    constructor(props: IProps){
        super(props);

        this.state = {
            popup: false,
            usage: props.channels.reduce((usage, channel) => {
                usage[channel.id] = channel.usage;
                return usage;
            }, {})
        };
    }

    componentDidMount() {
        this.mounted = true;
        this.subscribeUsage();
    }

    componentWillUnmount(){
        this.mounted = false;
        this.unsubscribeUsage();
    }

    async subscribeUsage(){
        const { ws, channels } = this.props;
        const ids = channels.map(channel => channel.id);
        this.subscribeId = await ws.subscribe('usage', ids, this.updateUsage);
    }

    unsubscribeUsage(){
        const { ws } = this.props;
        ws.unsubscribe(this.subscribeId);
        this.subscribeId = null;
    }

    updateUsage = (usage: IState['usage']) => {
        if(this.mounted){
            this.setState({usage});
        }
    }

    private getColumns(){

        return [
            Id,
            Offering,
            Agent,
            ContractStatus,
            ServiceStatus,
            JobStatus,
            Usage,
            CostPRIX
        ];
    }

    render() {

        const { t, channels } = this.props;
        const { usage } = this.state;

        const connections = channels.map((channel: any) => {

            return {
                id: <ModalWindow
                    visible={this.state.popup}
                    customClass='shortTableText'
                    modalTitle={t('Connection')}
                    text={channel.id}
                    copyToClipboard={true}
                    component={<Connection connection={channel} />}
                />,
                offering: <ModalWindow
                    visible={this.state.popup}
                    customClass='shortTableText'
                    modalTitle={t('Offering')}
                    text={channel.offeringHash}
                    copyToClipboard={true}
                    component={<OfferingById offeringId={channel.offering} />}
                />,
                agent: channel.agent,
                contractStatus: channel.channelStatus.channelStatus,
                serviceStatus: channel.channelStatus.serviceStatus,
                jobStatus: channel.job,
                usage: usage[channel.id],
                costPRIX: usage[channel.id],
            };
        });

        return <div className='row'>
            <div className='col-12'>
                <div className='card m-b-20'>
                    <h5 className='card-header'>{t('ActiveConnection')}</h5>
                    <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                        <div className='card-body'>
                            <div className='bootstrap-table bootstrap-table-sortable table-responsive'>
                                <SortableTable
                                    data={connections}
                                    columns={this.getColumns()}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default ws<IProps>(withRouter(ActiveConnection));
