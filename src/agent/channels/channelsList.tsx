import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import ChannelsListSortTable from './channelsListSortTable';
import Channel from './channel';
import Product from 'agent/products/product';
import ModalWindow from 'common/modalWindow';
import toFixedN from 'utils/toFixedN';

import { State } from 'typings/state';
import { Offering } from 'typings/offerings';

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
        };

    }

    refresh = async () => {

        const { ws } = this.props;

        const channels = (await ws.getAgentChannels([], [], 0, 0)).items;

        if (!this.subscription) {
            const channelsIds = channels.map(channel => channel.id);
            if(channelsIds.length){
                this.subscription = await ws.subscribe('channel', channelsIds, this.refresh);
            }
        }

        const products = (await Promise.all(channels.map(channel => ws.getOffering(channel.offering)) as Promise<Offering>[] )).map(offering => offering.product);
        const allProducts = await ws.getProducts();

        this.setState({channels, products, allProducts, isLoading: false});

    }

    componentDidMount() {
        this.refresh();
    }

    componentWillUnmount() {

        const { ws } = this.props;

        if (this.subscription) {
            ws.unsubscribe(this.subscription);
        }

        this.subscription = undefined;
    }

    render() {

        const { t } = this.props;

        const channelsDataArr = this.state.products
            .map((productId) => this.state.allProducts.find(product => product.id === productId))
            .map((product, index) => {
                    const channel = this.state.channels[index];
                    return {
                        id: <ModalWindow customClass='shortTableText'
                                         modalTitle={t('Service')}
                                         text={channel.id}
                                         copyToClipboard={true}
                                         component={<Channel channel={channel} />}
                            />,
                        server: <ModalWindow customClass=''
                                             modalTitle={t('ServerInfo')}
                                             text={product.name}
                                             component={<Product product={product} />}
                                />,
                        client: channel.client,
                        contractStatus: channel.channelStatus,
                        serviceStatus: channel.serviceStatus,
                        usage: {channelId: channel.id, channelStatus: channel.serviceStatus},
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
    return (Object.assign({}, {ws: state.ws}, onProps));
} )(withRouter(AsyncChannels));
