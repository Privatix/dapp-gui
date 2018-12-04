import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import ChannelsListSortTable from './channelsListSortTable';

import {asyncProviders} from 'redux/actions';

import Channel from './channel';
import ModalWindow from 'common/modalWindow';
import Product from 'agent/products/product';

import toFixedN from 'utils/toFixedN';
import { WS } from 'utils/ws';

import {Product as ProductType} from 'typings/products';
import {State} from 'typings/state';
import {Channel as ChannelType, ServiceStatus} from 'typings/channels';

interface IProps{
    status: ServiceStatus;
    registerRefresh?: Function;
}
interface Props {
    status: ServiceStatus;
    registerRefresh?: Function;
    products: ProductType[];
    dispatch: any;
    t?: any;
    ws: WS;
}

@translate(['channels/channelsList'])

class Channels extends React.Component<Props, any> {

    subscription: string;

    constructor(props: Props) {
        super(props);

        this.state = {
            status: props.status,
            lastUpdatedStatus: null,
            productsByChannels: [],
            channels: [],
            handler: null
        };

        if ('function' === typeof props.registerRefresh) {
            props.registerRefresh(this.refresh);
        }

    }

    refreshIfStatusChanged() {
        if (this.state.lastUpdatedStatus === this.state.status) {
            return;
        }

        this.refresh(true);
    }

    componentDidMount(){
        // TODO remove this when storage will subscribe to the products
        this.props.dispatch(asyncProviders.updateProducts());
        this.refresh();
    }

    componentWillUnmount() {
        const { ws } = this.props;

        this.clearTimeoutHandler();

        if (this.subscription) {
            ws.unsubscribe(this.subscription);
            this.subscription = undefined;
        }
    }

    refresh = async (once?: boolean) => {

        const status = this.state.status;
        let statusArr = [status];
        const { ws } = this.props;

        if (status === 'active') {
            statusArr = ['pending', 'activating', 'active', 'suspending', 'suspended', 'terminating'];
        }

        const channels = await ws.getAgentChannels([], statusArr, 0, 100);

        if (!this.subscription) {
            const channelsIds = channels.items.map(channel => channel.id);
            if(channelsIds.length){
                this.subscription = await ws.subscribe('channel', channelsIds, this.refresh);
            }
        }

        const channelsOfferings = channels.items.map((channel: ChannelType) => ws.getOffering(channel.offering));
        const offerings = await Promise.all(channelsOfferings);
        const productsByChannels = offerings.map(offering => offering.product);

        this.setState({
            lastUpdatedStatus: status,
            productsByChannels,
            channels: channels.items,
        });

        if (!once) {
            this.clearTimeoutHandler();

            const handler = setTimeout(() => {
                this.refresh();
            }, 5000);
            this.setState({handler});
        }
    }

    clearTimeoutHandler() {
        if (this.state.handler !== null) {
            clearInterval(this.state.handler);
        }
    }

    static getDerivedStateFromProps(props: any, state: any){
        return {status: props.status};
    }

    render (){

        this.refreshIfStatusChanged();

        const { t } = this.props;

        const channelsDataArr = this.state.productsByChannels
            .map((productId) => this.props.products.find(product => productId === product.id))
            .map((product, index) => {
            const channel = this.state.channels[index];
            return {
                id: <ModalWindow customClass='shortTableText' modalTitle={t('Service')} text={channel.id} copyToClipboard={true} component={<Channel channel={channel} />} />,
                server: <ModalWindow customClass='' modalTitle={t('ServerInfo')} text={product.name} component={<Product product={product} />} />,
                client: channel.client,
                contractStatus: channel.channelStatus,
                serviceStatus: channel.serviceStatus,
                usage: [channel.id, channel.serviceStatus],
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
