import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import SortableTable from 'react-sortable-table-vilan';

import OfferingStatus from './offeringStatus';
import MessageStatus from './messageStatus';
import ModalPropTextSorter from '../utils/sorters/sortingModalByPropText';
import ModalWindow from '../modalWindow';
import Offering from './offering';
import Product from '../products/product';
import { State } from '../../typings/state';
// import base64ToHex from '../utils/base64ToHex';

import { WS } from '../../utils/ws';

interface IProps {
    product: string;
    rate?: number;
    ws?: WS;
    t?: any;
}

@translate(['offerings/offeringsList'])
class OfferingsList extends React.Component<IProps, any> {

    constructor(props:IProps) {
        super(props);

        this.state = {
            handler: 0,
            offerings: [],
            products: []
        };
    }

    async refresh() {

        const { ws } = this.props;

        const {offerings, products} = await ws.fetchOfferingsAndProducts(this.props.product === 'all' ? '' : this.props.product);
        this.setState({offerings, products});

        const handler = setTimeout(this.refresh.bind(this), this.props.rate ? this.props.rate : 3000);
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
                id: <ModalWindow customClass='shortTableText' modalTitle={t('Offering')} text={'0x' + offering.hash} copyToClipboard={true} component={<Offering offering={offering} />} />,
                serviceName: offering.serviceName,
                server: <ModalWindow customClass='' modalTitle={t('ServerInfo')} text={offering.productName} component={<Product product={product} />} />,
                status: offering.status,
                offerStatus: offering.offerStatus,
                availableSupply: offering.currentSupply,
                supply: offering.supply
            };

            offeringsDataArr.push(row);
        });

        const columns = [
            {
                header: 'ID',
                key: 'id',
                dataProps: { className: 'shortTableTextTd' },
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
                header: t('MessageStatus'),
                key: 'status',
                headerStyle: {textAlign: 'center'},
                dataProps: {className: 'text-center'},
                render: (status) => { return <MessageStatus status={status} />; }
            },
            {
                header: t('Status'),
                key: 'offerStatus',
                headerStyle: {textAlign: 'center'},
                dataProps: {className: 'text-center'},
                render: (offerStatus) => { return <OfferingStatus status={offerStatus} />; }
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
                    <div className='bootstrap-table bootstrap-table-sortable table-responsive'>
                        <SortableTable
                            data={offeringsDataArr}
                            columns={columns} />
                    </div>
                </div>
            </div>
        </div>;
    }

}

export default connect( (state: State, onProps: IProps) => {
    return (Object.assign({}, {ws: state.ws}, onProps));
} )(OfferingsList);
