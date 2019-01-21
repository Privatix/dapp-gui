import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import ChannelsListSortTable from './channelsListSortTable';

import Channel from './channel';
import ModalWindow from 'common/modalWindow';
import Product from 'agent/products/product';

import toFixedN from 'utils/toFixedN';
import { WS } from 'utils/ws';

import { Product as ProductType } from 'typings/products';
import { Offering } from 'typings/offerings';
import { State } from 'typings/state';
import { ServiceStatus } from 'typings/channels';

interface IProps{
    status?: ServiceStatus;
}

interface Props {
    status?: ServiceStatus;
    products: ProductType[];
    dispatch: any;
    t?: any;
    ws: WS;
}

@translate(['channels/channelsList'])
class Channels extends React.Component<Props, any> {

    private subscription: string;
    private onNewChannelSubscription: string;

    constructor(props: Props) {
        super(props);

        this.state = {
            status: props.status,
            lastUpdatedStatus: null,
            productsByChannels: [],
            channels: [],
        };

    }

    refreshIfStatusChanged() {
        if (this.state.lastUpdatedStatus === this.state.status) {
            return;
        }

        this.refresh();
    }

    componentDidMount(){
        this.refresh();
    }

    componentWillUnmount() {
        this.stop();
    }

    stop() {

        const { ws } = this.props;

        if (this.subscription) {
            ws.unsubscribe(this.subscription);
            this.subscription = undefined;
        }

        if (this.subscription) {
            ws.unsubscribe(this.onNewChannelSubscription);
            this.onNewChannelSubscription = undefined;
        }

    }

    refresh = async () => {

        this.stop();

        const status = this.state.status;
        const { ws } = this.props;
        let statusArr;

        if (status === 'active') {
            statusArr = ['pending', 'activating', 'active', 'suspending', 'suspended', 'terminating'];
        }else{
            statusArr = status ? [status] : [];
        }

        const getActiveChannels = ws.getAgentChannels.bind(ws, [], statusArr, 0, 0);
        const channels = await getActiveChannels();

        const channelsIds = channels.items.map(channel => channel.id);
        if(channelsIds.length){
            this.subscription = await ws.subscribe('channel', channelsIds, this.refresh);
        }

        if(!this.onNewChannelSubscription){
            this.onNewChannelSubscription = await ws.subscribe('channel', ['agentAfterChannelCreate'], this.refresh);
        }

        const channelsOfferings: Promise<Offering>[] = channels.items.map(channel => ws.getOffering(channel.offering));
        const offerings = (await Promise.all(channelsOfferings)) as Offering[];
        const productsByChannels = offerings.map(offering => offering.product);

        this.setState({
            lastUpdatedStatus: status,
            productsByChannels,
            channels: channels.items,
        });

    }

    static getDerivedStateFromProps(props: any, state: any){
        return {status: props.status};
    }

    render (){

        // Bad idea! It shouldn't be here!
        this.refreshIfStatusChanged();

        const { t, products } = this.props;
        const { productsByChannels, channels } = this.state;

        const channelsDataArr = productsByChannels
            .map((productId) => products.find(product => productId === product.id))
            .map((product, index) => {
                const channel = channels[index];
                return {
                    id: <ModalWindow customClass='shortTableText'
                                     modalTitle={t('Service')}
                                     text={channel.id}
                                     copyToClipboard={true}
                                     component={<Channel channel={channel} />}
                        />,
                    server: <ModalWindow customClass=''
                                         modalTitle={t('ServerInfo')}
                                         text={product ? product.name : ''}
                                         component={<Product product={product} />}
                            />,
                    client: channel.client,
                    contractStatus: channel.channelStatus,
                    serviceStatus: channel.serviceStatus,
                    usage: {channelId: channel.id, channelStatus: channel.serviceStatus},
                    incomePRIX: toFixedN({number: (channel.receiptBalance/1e8), fixed: 8}),
                    serviceChangedTime: channel.serviceChangedTime
                };
            });

        return <div className='row'>
            <div className='col-12'>
                <div className='card-box'>
                    <ChannelsListSortTable data={channelsDataArr} />
                </div>
            </div>
        </div>;
    }
}

export default connect( (state: State, ownProps: IProps) => Object.assign({}, {products: state.products, ws: state.ws}, ownProps))(Channels);
