import * as React from 'react';
import {fetch} from '../../utils/fetch';
import {asyncReactor} from 'async-reactor';
import ChannelUsage from './channelUsage';
import ProductByOffering from '../products/productByOffering';
import PgTime from '../utils/pgTime';
import ChannelStatusStyle from './channelStatusStyle';
import ContractStatus from './contractStatus';
import SortableTable from 'react-sortable-table-vilan';
import { HtmlElSorter } from '../utils/sortingHtmlEl';
import Channel from './channel';
import ModalWindow from '../modalWindow';
import Product from '../products/product';

function Loader() {

  return (<b>Loading channels ...</b>);

}

async function AsyncChannels (props:any){

    let endpoint;

    if(props.offering){
        endpoint = '/channels' + (props.offering === 'all' ? '' : `?offeringId=${props.offering}`);
    }else{
        endpoint = '/channels' + (props.match.params.offering === 'all' ? '' : `?offeringId=${props.match.params.offering}`);
    }

    const channels = await fetch(endpoint, {method: 'GET'});

    const channelsProducts = (channels as any).map((channel: any) => ProductByOffering(channel.offering));

    const products = await Promise.all(channelsProducts);
    const channelsDataArr = (products as any).map((product, index) => {
        const channel = channels[index];
        return {
            id: <ModalWindow customClass='' modalTitle='Service' text={channel.id} component={<Channel channel={channel} />} />,
            // server: <LinkToProductByOfferingId offeringId={channel.offering} ><ProductNameByOffering offeringId={channel.offering} /></LinkToProductByOfferingId>,
            server: <ModalWindow customClass='' modalTitle='Server info' text={product.name} component={<Product product={product} />} />,
            client: channel.client,
            contractStatus: <ContractStatus contractStatus={channel.channelStatus} />,
            serviceStatus: <ChannelStatusStyle serviceStatus={channel.serviceStatus} />,
            usage: <ChannelUsage channelId={channel.id} />,
            incomePRIX: (channel.receiptBalance/1e8).toFixed(3),
            serviceChangedTime: <PgTime time={channel.serviceChangedTime} />
        };
    });

    const columns = [
        {
            header: 'ID',
            key: 'id',
            descSortFunction: HtmlElSorter.desc,
            ascSortFunction: HtmlElSorter.asc
        },
        {
            header: 'Server',
            key: 'server',
            descSortFunction: HtmlElSorter.desc,
            ascSortFunction: HtmlElSorter.asc
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
            descSortFunction: HtmlElSorter.desc,
            ascSortFunction: HtmlElSorter.asc
        },
        {
            header: 'Service Status',
            key: 'serviceStatus',
            headerStyle: {textAlign: 'center'},
            dataProps: { className: 'text-center'},
            descSortFunction: HtmlElSorter.desc,
            ascSortFunction: HtmlElSorter.asc
        },
        {
            header: 'Usage',
            key: 'usage',
            descSortFunction: HtmlElSorter.desc,
            ascSortFunction: HtmlElSorter.asc
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
            descSortFunction: HtmlElSorter.desc,
            ascSortFunction: HtmlElSorter.asc
        }
    ];

    return <div className='container-fluid'>
        <div className='row'>
            <div className='col-sm-12 m-b-15'>
                <h3 className='page-title'>All Services</h3>
            </div>
        </div>
            <div className='row'>
                <div className='col-12'>
                    <div className='card-box'>
                        <div className='bootstrap-table bootstrap-table-sortable'>
                            <SortableTable
                                data={channelsDataArr}
                                columns={columns} />
                        </div>
                    </div>
                </div>
          </div>
        </div>;
}

export default asyncReactor(AsyncChannels, Loader);
