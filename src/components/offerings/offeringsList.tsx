import * as React from 'react';
// import { Link } from 'react-router-dom';
import {fetch} from '../../utils/fetch';

import OfferingStatus from './offeringStatus';
import SortableTable from 'react-sortable-table-vilan';
import OfferingsSorterById from '../utils/sorters/sortingOfferingsById';
import ModalWindow from '../modalWindow';
import Offering from './offering';
import Product from '../products/product';

class AsyncOfferings extends React.Component<any, any> {

    constructor(props:any) {
        super(props);

        this.state = {
            handler: 0,
            offerings: [],
            products: []
        };
    }

    async refresh() {
        let endpoint;

        if(this.props.product){
            endpoint = '/offerings/' + (this.props.product === 'all' ? '' : `?product=${this.props.product}`);
        }else{
            endpoint = '/offerings/' + (this.props.match.params.product === 'all' ? '' : `?product=${this.props.match.params.product}`);
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

        this.setState({offerings, products});

        const handler = setTimeout(this.refresh.bind(this), this.props.rate);
        this.setState({handler});
    }

    componentDidMount() {
        this.refresh();
    }

    componentWillUnmount() {
        if (this.state.handler) {
            clearTimeout(this.state.handler);
        }
    }

    render() {
        const offeringsDataArr = [];
        this.state.offerings.map((offering: any) => {
            let product = this.state.products.filter((product: any) => product.id === offering.product)[0];
            let row = {
                id: <ModalWindow customClass='' modalTitle='Offering' text={offering.id} component={<Offering offering={offering} />} />,
                serviceName: offering.serviceName,
                server: <ModalWindow customClass='' modalTitle='Server info' text={offering.productName} component={<Product product={product} />} />,
                status: offering.offerStatus,
                freeUnits: offering.freeUnits,
                maxUnits: offering.maxUnit
            };

            offeringsDataArr.push(row);
        });

        const columns = [
            {
                header: 'ID',
                key: 'id',
                descSortFunction: OfferingsSorterById.desc,
                ascSortFunction: OfferingsSorterById.asc
            },
            {
                header: 'Service name',
                key: 'serviceName'
            },
            {
                header: 'Server',
                key: 'server',
                sortable: false
            },
            {
                header: 'Status',
                key: 'status',
                headerStyle: {textAlign: 'center'},
                dataProps: {className: 'text-center'},
                render: (status) => { return <OfferingStatus status={status} />; }
            },
            {
                header: 'Free Services',
                key: 'freeUnits',
                headerStyle: {textAlign: 'center'},
                dataProps: { className: 'text-center'}
            },
            {
                header: 'Supply',
                key: 'maxUnits',
                headerStyle: {textAlign: 'center'},
                dataProps: { className: 'text-center'}
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

export default AsyncOfferings;
