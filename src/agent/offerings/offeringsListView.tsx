import * as React from 'react';
import { translate } from 'react-i18next';
import SortableTable from 'react-sortable-table-vilan';

import Offering from './offering';
import Product from 'agent/products/product';

import OfferingStatus from 'common/badges/offeringStatus';

import ModalPropTextSorter from 'common/sorters/sortingModalByPropText';
import ModalWindow from 'common/modalWindow';

import { Product as ProductType } from 'typings/products';
import { ResolvedOffering } from 'typings/offerings';

interface IProps {
    products: ProductType[];
    offerings: ResolvedOffering[];
    t?: any;
}

@translate(['offerings/offeringsList'])
class OfferingsListView extends React.Component<IProps, any> {

    render() {
        const { t, products } = this.props;
        const offerings = this.props.offerings
            .filter(o => o.status !== 'removed');

        const offeringsDataArr = offerings.map(offering => {
            const product = products.filter(product => product.id === offering.product)[0];
            return {
                hash: <ModalWindow customClass='shortTableText'
                                   modalTitle={t('Offering')}
                                   text={'0x' + offering.hash}
                                   copyToClipboard={true}
                                   component={<Offering offering={offering} />}
                      />,
                serviceName: offering.serviceName,
                server: <ModalWindow customClass=''
                                     modalTitle={t('ServerInfo')}
                                     text={offering.productName}
                                     component={<Product product={product} />}
                        />,
                offerStatus: offering.status,
                availableSupply: offering.currentSupply,
                supply: offering.supply
            };

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
