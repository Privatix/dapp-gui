import * as React from 'react';
import { connect } from 'react-redux';
import * as api from '../../utils/api';
import ChannelsListSortTable from './channelsListSortTable';
import Channel from './channel';
import ModalWindow from '../modalWindow';
import Product from '../products/product';
import toFixedN from '../../utils/toFixedN';
import {State} from '../../typings/state';
import {Channel as ChannelType, ServiceStatus} from '../../typings/channels';
import {Product as ProductType} from '../../typings/products';
import {asyncProviders} from '../../redux/actions';
import { translate } from 'react-i18next';

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
}

@translate(['channels/channelsList'])

class Channels extends React.Component<Props, any> {

    subscription: String;

    constructor(props: Props) {
        super(props);

        this.state = {
            status: props.status,
            lastUpdatedStatus: null,
            productsByChannels: [],
            channels: [],
            offerings: []
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

    ws = (event: any) => {
        console.log('WS event catched!!!!', event);
        this.refresh();
    }

    componentDidMount(){
        this.props.dispatch(asyncProviders.updateProducts());
        this.refresh();
    }

    componentWillUnmount() {
        if (this.subscription) {
            (window as any).ws.unsubscribe(this.subscription);
        }
    }

    refresh = async (once?: boolean) => {

        const status = this.state.status;

        const channels = await api.channels.getList(status);

        if (!this.subscription) {
            const channelsIds = (channels as any).map((channel: any) => channel.id);
            if(channelsIds.length){
                this.subscription = (window as any).ws.subscribe('channel', channelsIds, this.ws);
            }
        }

        const channelsOfferings = channels.map((channel: ChannelType) => (window as any).ws.getOffering(channel.offering));
        const offerings = await Promise.all(channelsOfferings);
        const productsByChannels = offerings.map(offering => offering.product);

        this.setState({
            lastUpdatedStatus: status,
            productsByChannels,
            channels,
            offerings
        });

        if(!once){
            setTimeout(this.refresh, 5000);
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
            const offering = this.state.offerings.find((offering) => offering.id === channel.offering);
            return {
                id: <ModalWindow customClass='shortTableText' modalTitle={t('Service')} text={channel.id} copyToClipboard={true} component={<Channel channel={channel} />} />,
                server: <ModalWindow customClass='' modalTitle={t('ServerInfo')} text={product.name} component={<Product product={product} />} />,
                client: channel.client,
                contractStatus: channel.channelStatus,
                serviceStatus: channel.serviceStatus,
                usage: [channel.id,((channel.totalDeposit-offering.setupPrice)/offering.unitPrice)],
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

export default connect( (state: State, ownProps: IProps) => Object.assign({}, {products: state.products}, ownProps))(Channels);
