import * as React from 'react';
import { translate } from 'react-i18next';
import SortableTable from 'react-sortable-table-vilan';

import OfferingStatus from './offeringStatus';
import MessageStatus from './messageStatus';
import ModalPropTextSorter from '../utils/sorters/sortingModalByPropText';
import ModalWindow from '../modalWindow';
import Offering from './offering';
import Product from '../products/product';

import { Product as ProductType } from 'typings/products';
import { Offering as OfferingType} from 'typings/offerings';

interface IProps {
    products: ProductType[];
    offerings: OfferingType[];
    t?: any;
}

@translate(['offerings/offeringsList'])
class OfferingsListView extends React.Component<IProps, any> {

    render() {

        const { t, products, offerings } = this.props;

        const offeringsDataArr = [];

        offerings.map((offering: any) => {
            let product = products.filter((product: any) => product.id === offering.product)[0];
            let row = {
                hash: <ModalWindow customClass='shortTableText' modalTitle={t('Offering')} text={'0x' + offering.hash} copyToClipboard={true} component={<Offering offering={offering} />} />,
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
                header: t('Hash'),
                key: 'hash',
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

export default OfferingsListView;