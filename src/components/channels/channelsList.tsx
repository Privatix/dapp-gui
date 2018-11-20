import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import {fetch} from '../../utils/fetch';
import ChannelsListSortTable from './channelsListSortTable';
import Channel from './channel';
import ModalWindow from '../modalWindow';
import Product from '../products/product';
import toFixedN from '../../utils/toFixedN';
import { State } from '../../typings/state';

@translate(['channels/channelsList', 'common'])
class AsyncChannels extends React.Component<any, any> {

    subscription: String;

    constructor(props: any) {
        super(props);
        this.state = {
            isLoading: true,
            products: [],
            allProducts: [],
            channels: [],
            offerings: []
        };

    }

    async refresh() {

        const { ws } = this.props;

        // TODO we need JSON-RPC method to fetch channels by offering id
        const endpoint = '/channels' + (this.props.offering === 'all' ? '' : `?offeringId=${this.props.offering}`);
        const channels = await fetch(endpoint, {method: 'GET'});

        if (!this.subscription) {
            const channelsIds = (channels as any).map((channel: any) => channel.id);
            if(channelsIds.length){
                this.subscription = ws.subscribe('channel', channelsIds, this.refresh);
            }
        }

        const channelsProductsIds = (channels as any).map(async (channel: any) => (await ws.getOffering(channel.offering)).product);
        const products = await Promise.all(channelsProductsIds);
        const offerings = await ws.getAgentOfferings();
        const allProducts = await ws.getProducts();

        this.setState({channels, products, allProducts, offerings: offerings.items, isLoading: false});

    }

    componentDidMount() {
        this.refresh();
    }

    componentWillUnmount() {

        const { ws } = this.props;

        if (this.subscription) {
            ws.unsubscribe(this.subscription);
        }
    }

    render() {

        const { t } = this.props;

        const channelsDataArr = this.state.products
            .map((productId) => this.state.allProducts.find((product) => product.id === productId))
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
                }
            );

        return this.state.isLoading ?
            <b>Loading channels ...</b> :
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-sm-12 m-b-15'>
                        <h3 className='page-title'>{t('AllServices')}</h3>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-sm-12 m-b-15'>
                        <div className='m-t-15'>
                            <a onClick={this.refresh} className='btn btn-default btn-custom waves-effect waves-light' href='#'>
                                {t('common:RefreshAll')}
                            </a>
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
    return (Object.assign({}, {ws: state.ws}, onProps));
} )(withRouter(AsyncChannels));
