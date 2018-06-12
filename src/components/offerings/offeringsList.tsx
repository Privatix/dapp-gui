import * as React from 'react';
import {asyncReactor} from 'async-reactor';
// import { Link } from 'react-router-dom';
import {fetch} from '../../utils/fetch';

import OfferingStatus from './offeringStatus';
import SortableTable from 'react-sortable-table-vilan';
import { HtmlElSorter } from '../utils/sortingHtmlEl';
import ModalWindow from '../modalWindow';
import Offering from './offering';
import Product from '../products/product';

function Loader() {

  return (<h2>Loading offerings ...</h2>);

}

async function AsyncOfferings (props: any){

    let endpoint;

    if(props.product){
        endpoint = '/offerings/' + (props.product === 'all' ? '' : `?product=${props.product}`);
    }else{
        endpoint = '/offerings/' + (props.match.params.product === 'all' ? '' : `?product=${props.match.params.product}`);
    }

    const offeringsRequest = fetch(endpoint, {method: 'GET'});
    const productsRequest = fetch('/products', {});
    let offerings, products;
    [offerings, products] = await Promise.all([offeringsRequest, productsRequest]);
    const resolveTable = (products as any).reduce((table, product) => {
        table[product.id] = product.name;
        return table;
    }, {});

    offerings = (offerings as any).map(offering => Object.assign(offering, {productName: resolveTable[offering.product]}));

    const offeringsDataArr = [];
    (offerings as any).map((offering: any) => {
        let product = (products as any).filter((product: any) => product.id === offering.product)[0];
        let row = {
            id: <ModalWindow customClass='' modalTitle='Offering' text={offering.id} component={<Offering offering={offering} />} />,
            serviceName: offering.serviceName,
            server: <ModalWindow customClass='' modalTitle='Server info' text={offering.productName} component={<Product product={product} />} />,
            status: <OfferingStatus offeringId={offering.id} rate={3000} />,
            freeUnits: offering.freeUnits,
            maxUnits: offering.maxUnit
        };

        offeringsDataArr.push(row);
    });

    const columns = [
        {
            header: 'ID',
            key: 'id'
        },
        {
            header: 'Service name',
            key: 'serviceName'
        },
        {
            header: 'Server',
            key: 'server',
            descSortFunction: HtmlElSorter.desc,
            ascSortFunction: HtmlElSorter.asc
        },
        {
            header: 'Status',
            key: 'status',
            headerStyle: {textAlign: 'center'},
            dataProps: {className: 'text-center'},
            descSortFunction: HtmlElSorter.desc,
            ascSortFunction: HtmlElSorter.asc
        },
        {
            header: 'Free Services',
            key: 'freeUnits',
            headerStyle: {textAlign: 'center'},
            dataProps: { className: 'text-center'},
        },
        {
            header: 'Supply',
            key: 'maxUnits',
            headerStyle: {textAlign: 'center'},
            dataProps: { className: 'text-center'},
        }
    ];

    return <div className='row'>
        <div className='col-12'>
            <div className='card-box'>
                <div className='bootstrap-table bootstrap-table-sortable'>
                    <SortableTable
                        data={offeringsDataArr}
                        columns={columns} />
                </div>
            </div>
        </div>
    </div>;
}

export default asyncReactor(AsyncOfferings, Loader);
