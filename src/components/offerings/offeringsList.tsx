import * as React from 'react';
// import {asyncReactor} from 'async-reactor';
// import { Link } from 'react-router-dom';
// import {fetchOfferings} from './utils';

import OfferingStatus from './offeringStatus';
import SortableTable from 'react-sortable-table-vilan';
import { HtmlElSorter } from '../utils/sortingHtmlEl';
import ModalWindow from '../modalWindow';
import Offering from './offering';
import Product from '../products/product';

export default class OfferingsList extends React.Component<any, any>{

    render(){

        const {offerings, products} = this.props;
        const offeringsDataArr = [];
        (offerings as any).map((offering: any) => {
            let product = (products as any).filter((product: any) => product.id === offering.product)[0];
            let row = {
                id: <ModalWindow customClass='' modalTitle='Offering' text={offering.id} component={<Offering offering={offering} />} />,
                serviceName: offering.serviceName,
                server: <ModalWindow customClass='' modalTitle='Server info' text={offering.productName} component={<Product product={product} />} />,
                status: <OfferingStatus offeringId={offering.id} rate={3000} />,
                supply: offering.supply,
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
                header: 'Supply',
                key: 'supply',
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
}
