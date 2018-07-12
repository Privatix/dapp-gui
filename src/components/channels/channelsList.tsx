import * as React from 'react';
import { withRouter } from 'react-router-dom';
import {fetch} from '../../utils/fetch';
import ProductByOffering from '../products/productByOffering';
import ChannelsListSortTable from './channelsListSortTable';
import Channel from './channel';
import ModalWindow from '../modalWindow';
import Product from '../products/product';
import toFixed8 from '../../utils/toFixed8';

class AsyncChannels extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            isLoading: true,
            channelsDataArr: []
        };
    }

    async refresh() {
        const endpoint = '/channels' + (this.props.offering === 'all' ? '' : `?offeringId=${this.props.offering}`);

        const channels = await fetch(endpoint, {method: 'GET'});
        const channelsProducts = (channels as any).map((channel: any) => ProductByOffering(channel.offering));
        const products = await Promise.all(channelsProducts);

        const channelsDataArr = (products as any).map((product, index) => {
            const channel = channels[index];
            return {
                id: <ModalWindow customClass='' modalTitle='Service' text={channel.id} component={<Channel channel={channel} />} />,
                server: <ModalWindow customClass='' modalTitle='Server info' text={product.name} component={<Product product={product} />} />,
                client: channel.client ? channel.client : '',
                contractStatus: channel.channelStatus,
                serviceStatus: channel.serviceStatus,
                usage: channel.id,
                incomePRIX: toFixed8({number: (channel.receiptBalance/1e8)}),
                serviceChangedTime: channel.serviceChangedTime
            };
        });

        this.setState({channelsDataArr});

    }

    componentDidMount() {
        this.refresh();
        this.setState({isLoading: false});
    }

    render() {
        return this.state.isLoading ?
            <b>Loading channels ...</b> :
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-sm-12 m-b-15'>
                        <h3 className='page-title'>All Services</h3>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-sm-12 m-b-15'>
                        <div className='m-t-15'>
                            <a onClick={this.refresh.bind(this)} className='btn btn-default btn-custom waves-effect waves-light' href='#'>Refresh all</a>
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-12'>
                        <div className='card-box'>
                            <ChannelsListSortTable data={this.state.channelsDataArr} />
                        </div>
                    </div>
                </div>
            </div>;
    }

}

export default withRouter(AsyncChannels);
