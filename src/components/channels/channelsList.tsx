import * as React from 'react';
import { withRouter } from 'react-router-dom';
import {fetch} from '../../utils/fetch';
import ChannelUsage from './channelUsage';
import ProductByOffering from '../products/productByOffering';
import PgTime from '../utils/pgTime';
import ChannelStatusStyle from './channelStatusStyle';
import ContractStatus from './contractStatus';
import SortableTable from 'react-sortable-table-vilan';
import ModalPropTextSorter from '../utils/sorters/sortingModalByPropText';
import Channel from './channel';
import ModalWindow from '../modalWindow';
import Product from '../products/product';

class AsyncChannels extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            isLoading: true,
            channelsDataArr: [],
            columns: [],
        };
        this.refresh = this.refresh.bind(this);
    }

    async refresh() {
        let endpoint;

        if(this.props.offering){
            endpoint = '/channels' + (this.props.offering === 'all' ? '' : `?offeringId=${this.props.offering}`);
        }else{
            endpoint = '/channels' + (this.props.match.params.offering === 'all' ? '' : `?offeringId=${this.props.match.params.offering}`);
        }

        const channels = await fetch(endpoint, {method: 'GET'});

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
                usage: <ChannelUsage channelId={channel.id} />,
                incomePRIX: (channel.receiptBalance/1e8).toFixed(3),
                serviceChangedTime: channel.serviceChangedTime
            };
        });

        const columns = [
            {
                header: 'ID',
                key: 'id',
                descSortFunction: ModalPropTextSorter.desc,
                ascSortFunction: ModalPropTextSorter.asc
            },
            {
                header: 'Server',
                key: 'server',
                descSortFunction: ModalPropTextSorter.desc,
                ascSortFunction: ModalPropTextSorter.asc
            },
            {
                header: 'Client',
                key: 'client'
            },
            {
                header: 'Contract Status',
                key: 'contractStatus',
                headerStyle: {textAlign: 'center'},
                dataProps: { className: 'text-center'},
                render: (channelStatus) => { return <ContractStatus contractStatus={channelStatus} />; }
            },
            {
                header: 'Service Status',
                key: 'serviceStatus',
                headerStyle: {textAlign: 'center'},
                dataProps: { className: 'text-center'},
                render: (serviceStatus) => { return <ChannelStatusStyle serviceStatus={serviceStatus} />; }
            },
            {
                header: 'Usage',
                key: 'usage'
            },
            {
                header: 'Income (PRIX)',
                key: 'incomePRIX',
                headerStyle: {textAlign: 'center'},
                dataProps: { className: 'text-center'},
            },
            {
                header: 'Service Changed Time',
                key: 'serviceChangedTime',
                render: (serviceChangedTime) => { return <PgTime time={serviceChangedTime} />; }
            }
        ];

        this.setState({
            channelsDataArr: channelsDataArr,
            columns: columns,
        });

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
                            <a onClick={this.refresh} className='btn btn-default btn-custom waves-effect waves-light' href='#'>Refresh all</a>
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-12'>
                        <div className='card-box'>
                            <div className='bootstrap-table bootstrap-table-sortable'>
                                <SortableTable
                                    data={this.state.channelsDataArr}
                                    columns={this.state.columns} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>;
    }

}

export default withRouter(AsyncChannels);
