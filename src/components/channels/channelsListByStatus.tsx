import * as React from 'react';
import {fetch} from '../../utils/fetch';
import ChannelsListSortTable from './channelsListSortTable';
import ProductByOffering from '../products/productByOffering';
import Channel from './channel';
import ModalWindow from '../modalWindow';
import Product from '../products/product';
import toFixed8 from '../../utils/toFixed8';

class Channels extends React.Component<any, any> {

    constructor(props: any) {
        super(props);

        this.state = {
            channels: props.channels,
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

    async refresh() {
        const status = this.state.status;

        let endpoint = `/channels/?serviceStatus=active`;
        let channels = {};
        if (status === 'active') {
            channels = await fetch(endpoint);
        } else {
            endpoint = `/channels/?serviceStatus=terminated`;
            channels = await fetch(endpoint);
        }

        const channelsProducts = (channels as any).map((channel: any) => ProductByOffering(channel.offering));
        const products = await Promise.all(channelsProducts);

        const channelsDataArr = (products as any).map((product, index) => {
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

export default Channels;
