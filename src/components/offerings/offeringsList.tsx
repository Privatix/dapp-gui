import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import {fetch} from '../../utils/fetch';

import OfferingStatus from './offeringStatus';
import SortableTable from 'react-sortable-table-vilan';
import ModalPropTextSorter from '../utils/sorters/sortingModalByPropText';
import ModalWindow from '../modalWindow';
import Offering from './offering';
import Product from '../products/product';
import { State } from '../../typings/state';
import {asyncProviders} from '../../redux/actions';
import base64ToHex from '../utils/base64ToHex';

@translate(['offerings/offeringsList'])
class Offerings extends React.Component<any, any> {

    constructor(props:any) {
        super(props);

        this.state = {
            handler: 0,
            offerings: [],
            products: []
        };
    }

    async refresh() {

        const endpoint = '/offerings/' + (this.props.product === 'all' ? '' : `?product=${this.props.product}`);

        const offeringsRaw = await fetch(endpoint, {method: 'GET'});
        this.props.dispatch(asyncProviders.updateProducts());

        const resolveTable = (this.props.products as any).reduce((table, product) => {
            table[product.id] = product.name;
            return table;
        }, {});

        const offerings = (offeringsRaw as any).map(offering => Object.assign(offering, {productName: resolveTable[offering.product]}));

        this.setState({offerings, products: this.props.products});

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

        const { t } = this.props;

        const offeringsDataArr = [];

        this.state.offerings.map((offering: any) => {
            let product = this.state.products.filter((product: any) => product.id === offering.product)[0];
            let row = {
                id: <ModalWindow customClass='' modalTitle={t('Offering')} text={base64ToHex(offering.hash)} component={<Offering offering={offering} />} />,
                serviceName: offering.serviceName,
                server: <ModalWindow customClass='' modalTitle={t('ServerInfo')} text={offering.productName} component={<Product product={product} />} />,
                status: offering.status,
                availableSupply: offering.currentSupply,
                supply: offering.supply
            };

            offeringsDataArr.push(row);
        });

        const columns = [
            {
                header: 'ID',
                key: 'id',
                descSortFunction: ModalPropTextSorter.desc,
                ascSortFunction: ModalPropTextSorter.asc
            },
            {
                header: t('ServiceName'),
                key: 'serviceName'
            },
            {
                header: t('Server'),
                key: 'server',
                sortable: false
            },
            {
                header: t('Status'),
                key: 'status',
                headerStyle: {textAlign: 'center'},
                dataProps: {className: 'text-center'},
                render: (status) => { return <OfferingStatus status={status} />; }
            },
            {
                header: t('AvailableSupply'),
                key: 'availableSupply',
                headerStyle: {textAlign: 'center'},
                dataProps: { className: 'text-center'}
            },
            {
                header: t('Supply'),
                key: 'supply',
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

export default connect( (state: State, onProps: any) => {
    return (Object.assign({}, {products: state.products}, onProps));
} )(Offerings);
