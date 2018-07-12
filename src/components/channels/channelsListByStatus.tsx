import * as React from 'react';
import { connect } from 'react-redux';
import * as api from '../../utils/api';
import ChannelsListSortTable from './channelsListSortTable';
import Channel from './channel';
import ModalWindow from '../modalWindow';
import Product from '../products/product';
import toFixed8 from '../../utils/toFixed8';
import {State} from '../../typings/state';
import {Channel as ChannelType, ServiceStatus} from '../../typings/channels';
import {Product as ProductType} from '../../typings/products';
import {asyncProviders} from '../../redux/actions';

interface IProps{
    status: ServiceStatus;
    registerRefresh?: Function;
}
interface Props {
    status: ServiceStatus;
    registerRefresh?: Function;
    products: ProductType[];
    dispatch: any;
}

class Channels extends React.Component<Props, any> {

    constructor(props: Props) {
        super(props);

        this.state = {
            status: props.status,
            channelsDataArr: [],
            lastUpdatedStatus: null
        };

        if ('function' === typeof props.registerRefresh) {
            props.registerRefresh(this.refresh.bind(this));
        }
    }

    refreshIfStatusChanged() {
        if (this.state.lastUpdatedStatus === this.state.status) {
            return;
        }

        this.refresh();
    }

    componentDidMount(){
        this.props.dispatch(asyncProviders.updateProducts());
    }

    async refresh() {

        const status = this.state.status;

        const channels = await api.getChannels(status);

        const channelsOfferings = channels.map((channel: ChannelType) => api.getOfferingById(channel.offering));
        const offerings = await Promise.all(channelsOfferings);
        const products = offerings.map(offering => this.props.products.find(product => offering.product === product.id));

        const channelsDataArr = products.map((product, index) => {
            const channel = channels[index];
            return {
                id: <ModalWindow customClass='' modalTitle='Service' text={channel.id} component={<Channel channel={channel} />} />,
                server: <ModalWindow customClass='' modalTitle='Server info' text={product.name} component={<Product product={product} />} />,
                client: channel.client,
                contractStatus: channel.channelStatus,
                serviceStatus: channel.serviceStatus,
                usage: channel.id,
                incomePRIX: toFixed8({number: (channel.receiptBalance/1e8)}),
                serviceChangedTime: channel.serviceChangedTime
            };
        });

        this.setState({
            channelsDataArr,
            lastUpdatedStatus: status
        });
    }

    static getDerivedStateFromProps(props: any, state: any){
        return {status: props.status};
    }

    render (){
        this.refreshIfStatusChanged();

        return <div className='row'>
            <div className='col-12'>
                <div className='card-box'>
                    <ChannelsListSortTable data={this.state.channelsDataArr} />
                </div>
            </div>
        </div>;
    }
}

export default connect( (state: State, ownProps: IProps) => Object.assign({}, {products: state.products}, ownProps))(Channels);
