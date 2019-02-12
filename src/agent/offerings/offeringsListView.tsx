import * as React from 'react';
import { translate } from 'react-i18next';
import SortableTable from 'react-sortable-table-vilan';

import Offering from './offering';
import Product from 'agent/products/product';

import ModalWindow from 'common/modalWindow';

import { Product as ProductType } from 'typings/products';
import { ResolvedOffering } from 'typings/offerings';

import { Hash, ServiceName, Server, OfferingStatus, AvailableSupply, Supply } from 'common/tables/';

interface IProps {
    products: ProductType[];
    offerings: ResolvedOffering[];
    t?: any;
    showRemoved?: boolean;
}

@translate(['offerings/offeringsList'])
class OfferingsListView extends React.Component<IProps, any> {

    render() {
        const { t, products } = this.props;
        const offerings = this.props.showRemoved
            ? this.props.offerings
            : this.props.offerings.filter(o => o.status !== 'removed');

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
            Hash,
            ServiceName,
            Server,
            OfferingStatus,
            AvailableSupply,
            Supply
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
