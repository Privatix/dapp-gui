import * as React from 'react';
import { withRouter } from 'react-router-dom';
import {fetch} from '../../utils/fetch';
import { GetProductIdByOfferingId } from '../products/productByOffering';
import ChannelsListSortTable from './channelsListSortTable';
import Channel from './channel';
import ModalWindow from '../modalWindow';
import Product from '../products/product';
import toFixed8 from '../../utils/toFixed8';
import { connect } from 'react-redux';
import { State } from '../../typings/state';
import {asyncProviders} from '../../redux/actions';
import base64ToHex from '../utils/base64ToHex';
import * as api from '../../utils/api';
import {channelStatusDescription} from './channel';

class AsyncChannels extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            isLoading: true,
            products: [],
            channels: [],
            offerings: []
        };

        this.props.dispatch(asyncProviders.updateProducts());
    }

    async refresh() {
        const endpoint = '/channels' + (this.props.offering === 'all' ? '' : `?offeringId=${this.props.offering}`);

        const channels = await fetch(endpoint, {method: 'GET'});
        const channelsProductsIds = (channels as any).map((channel: any) => GetProductIdByOfferingId(channel.offering));
        const products = await Promise.all(channelsProductsIds);
        const offerings = await api.offerings.getOfferings();
        this.props.dispatch(asyncProviders.updateProducts());
        this.props.dispatch(asyncProviders.updateOfferings());
        this.setState({channels, products, offerings});

    }

    componentDidMount() {
        this.refresh();
        this.setState({isLoading: false});
    }

    render() {
        const channelsDataArr = (this.state.products as any)
            .map((productId) => this.props.products.find((product) => product.id === productId))
            .map((product, index) => {
                    const channel = this.state.channels[index];
                    const offering = this.state.offerings.find((offering) => offering.id === channel.offering);
                    return {
                        id: <ModalWindow customClass='' modalTitle='Service' text={channel.id} component={<Channel channel={channel} />} />,
                        server: <ModalWindow customClass='' modalTitle='Server info' text={product.name} component={<Product product={product} />} />,
                        client: channel.client ? base64ToHex(channel.client) : '',
                        contractStatus: channelStatusDescription[channel.channelStatus],
                        serviceStatus: channel.serviceStatus,
                        usage: [channel.id,((channel.totalDeposit-offering.setupPrice)/offering.unitPrice)],
                        incomePRIX: toFixed8({number: (channel.receiptBalance/1e8)}),
                        serviceChangedTime: channel.serviceChangedTime
                    };
                }
            );

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
                            <ChannelsListSortTable data={channelsDataArr} />
                        </div>
                    </div>
                </div>
            </div>;
    }

}

export default connect( (state: State, onProps: any) => {
    return (Object.assign({}, {products: state.products}, onProps));
} )(withRouter(AsyncChannels));
