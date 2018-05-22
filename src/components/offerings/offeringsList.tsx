import * as React from 'react';
import {asyncReactor} from 'async-reactor';
import { Link } from 'react-router-dom';
import {fetch} from 'utils/fetch';

import OfferingStatus from './offeringStatus';
import SortableTable from 'react-sortable-table';
import { HtmlElSorter } from '../utils/sortingHtmlEl';

function Loader() {

  return (<h2>Loading offerings ...</h2>);

}

async function AsyncOfferings (props: any){

    let endpoint;

    if(props.product){
        endpoint = '/offerings' + (props.product === 'all' ? '' : `?product=${props.product}`);
    }else{
        endpoint = '/offerings' + (props.match.params.product === 'all' ? '' : `?product=${props.match.params.product}`);
    }

    const offeringsRequest = fetch(endpoint, {method: 'GET'});
    const productsRequest = fetch('/products', {});
    let offerings, products;
    [offerings, products] = await Promise.all([offeringsRequest, productsRequest]);

    const resolveTable = (products as any).reduce((table, product) => {
        table[product.id] = product.name;
        return table;
    });

    offerings = (offerings as any).map(offering => Object.assign(offering, {productName: resolveTable[offering.product]}));

    const offeringsDataArr = [];
    (offerings as any).map((offering: any) => {
        let row = {
            id: <Link to={`/offering/${JSON.stringify(offering)}/`}>{offering.id}</Link>,
            serviceName: offering.serviceName,
            server: <Link to={`/productById/${offering.product}`}>{offering.productName}</Link>,
            status: <OfferingStatus offeringId={offering.id} />,
            freeUnits: offering.freeUnits,
            maxUnits: offering.maxUnit
        };

        offeringsDataArr.push(row);
    });

    const columns = [
        {
            header: 'ID',
            key: 'id',
            descSortFunction: HtmlElSorter.desc,
            ascSortFunction: HtmlElSorter.asc
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
            header: 'Free Units',
            key: 'freeUnits',
            headerStyle: {textAlign: 'center'},
            dataProps: { className: 'text-center'},
        },
        {
            header: 'Max Units',
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
