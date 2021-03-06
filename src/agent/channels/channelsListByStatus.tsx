import * as React from 'react';
import { connect } from 'react-redux';
import { WithTranslation, withTranslation } from 'react-i18next';
import ChannelsListSortTable from './channelsListSortTable';

import Channel from './channel';
import ModalWindow from 'common/modalWindow';
import Product from 'agent/products/product';

import { WS } from 'utils/ws';

import { Product as ProductType } from 'typings/products';
import { Offering } from 'typings/offerings';
import { State } from 'typings/state';
import { ServiceStatus } from 'typings/channels';

interface IProps{
    status?: ServiceStatus;
}

interface Props extends WithTranslation {
    status?: ServiceStatus;
    products: ProductType[];
    dispatch: any;
    ws: WS;
}

const translate = withTranslation(['channels/channelsList']);

class Channels extends React.Component<Props, any> {

    private subscription: string;
    private onNewChannelSubscription: string;
    polling = null;
    private mounted = false;

    constructor(props: Props) {
        super(props);

        this.state = {
            status: props.status,
            lastUpdatedStatus: null,
            productsByChannels: [],
            channels: [],
            usage: {}
        };

    }

    refreshIfStatusChanged() {
        if (this.state.lastUpdatedStatus === this.state.status) {
            return;
        }
        this.refresh();
    }

    componentDidMount(){
        this.mounted = true;
        this.refresh();
    }

    componentWillUnmount() {
        this.mounted = false;
        this.stop();
    }

    stop() {

        const { ws } = this.props;

        if (this.subscription) {
            ws.unsubscribe(this.subscription);
            this.subscription = undefined;
        }

        if (this.onNewChannelSubscription) {
            ws.unsubscribe(this.onNewChannelSubscription);
            this.onNewChannelSubscription = undefined;
        }
        if (this.polling) {
            clearTimeout(this.polling);
            this.polling = null;
        }

    }

    refresh = async () => {

        this.stop();

        if(!this.mounted){
            return;
        }

        const { ws } = this.props;
        const { status } = this.state;
        let statusArr;

        if (status === 'active') {
            statusArr = ['pending', 'activating', 'active', 'suspending', 'suspended', 'terminating'];
        }else{
            statusArr = status ? [status] : [];
        }

        const channels = await ws.getAgentChannels([], statusArr, 0, 0);

        const channelsIds = channels.items.map(channel => channel.id);
        if(channelsIds.length){
            this.subscription = await ws.subscribe('channel', channelsIds, this.refresh);
            this.updateUsage(channelsIds);
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

    async updateUsage(ids: string[]){

        const { ws } = this.props;

        if(this.polling){
            clearTimeout(this.polling);
            this.polling = null;
        }
        if(this.mounted){
            this.polling = setTimeout(this.updateUsage.bind(this, ids), 3000);
            this.setState({usage: await ws.getChannelsUsage(ids)});
        }
    }

    static getDerivedStateFromProps(props: any){
        return {status: props.status};
    }

    render (){

        // Bad idea! It shouldn't be here!
        this.refreshIfStatusChanged();

        const { t, products } = this.props;
        const { productsByChannels, channels, usage } = this.state;

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
                    usage: usage[channel.id],
                    incomePRIX: usage[channel.id],
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

export default connect( (state: State, ownProps: IProps) => Object.assign({}, {products: state.products, ws: state.ws}, ownProps))(translate(Channels));
