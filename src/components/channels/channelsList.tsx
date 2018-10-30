import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import {fetch} from '../../utils/fetch';
import { GetProductIdByOfferingId } from '../products/productByOffering';
import ChannelsListSortTable from './channelsListSortTable';
import Channel from './channel';
import ModalWindow from '../modalWindow';
import Product from '../products/product';
import toFixedN from '../../utils/toFixedN';
import { State } from '../../typings/state';
import {asyncProviders} from '../../redux/actions';

@translate(['channels/channelsList', 'common'])
class AsyncChannels extends React.Component<any, any> {

    subscription: String;

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

    ws = (event: any) => {
        console.log('WS event catched!!!!', event);
        this.refresh();
    }

    async refresh() {

        const { ws } = this.props.ws;

        const endpoint = '/channels' + (this.props.offering === 'all' ? '' : `?offeringId=${this.props.offering}`);
        const channels = await fetch(endpoint, {method: 'GET'});

        if (!this.subscription) {
            const channelsIds = (channels as any).map((channel: any) => channel.id);
            if(channelsIds.length){
                this.subscription = ws.subscribe('channel', channelsIds, this.ws);
            }
        }

        const channelsProductsIds = (channels as any).map((channel: any) => GetProductIdByOfferingId(channel.offering));
        const products = await Promise.all(channelsProductsIds);
        const offerings = await ws.getAgentOfferings();
        this.props.dispatch(asyncProviders.updateProducts());
        this.props.dispatch(asyncProviders.updateOfferings());

        this.setState({channels, products, offerings});

    }

    componentDidMount() {
        this.refresh();
        this.setState({isLoading: false});
    }

    componentWillUnmount() {
        if (this.subscription) {
            (window as any).ws.unsubscribe(this.subscription);
        }
    }

    render() {

        const { t } = this.props;

        const channelsDataArr = (this.state.products as any)
            .map((productId) => this.props.products.find((product) => product.id === productId))
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
                            <a onClick={this.refresh.bind(this)} className='btn btn-default btn-custom waves-effect waves-light' href='#'>
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
    return (Object.assign({}, {ws: state.ws, products: state.products}, onProps));
} )(withRouter(AsyncChannels));
