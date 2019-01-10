import * as React from 'react';
import { translate } from 'react-i18next';
import SortableTable from 'react-sortable-table-vilan';

import Availability from './availability';
import ModalPropTextSorter from 'common/sorters/sortingModalByPropText';
import CopyToClipboard from 'common/copyToClipboard';

const translated = translate(['client/vpnList', 'common']);

class VPNListTable extends React.Component<any,any> {

    get columns(){
        const { t } = this.props;
        return [
            {
                header: t('Availability'),
                key: 'availability',
                headerStyle: {textAlign: 'center'},
                dataProps: {className: 'text-center'},
                render: (availability) => { return <Availability availability={availability} />; }
            },
            {
                header: t('Block'),
                key: 'block'
            },
            {
                header: t('Hash'),
                key: 'hash',
                dataProps: { className: 'shortTableTextTd' },
                descSortFunction: ModalPropTextSorter.desc,
                ascSortFunction: ModalPropTextSorter.asc
            },
            {
                header: t('Agent'),
                key: 'agent',
                dataProps: { className: 'shortTableTextTd' },
                render: (agent) => {
                    const agentText = '0x' + agent;
                    return <div>
                        <span className='shortTableText' title={agentText}>{agentText}</span>
                        <CopyToClipboard text={agentText} />
                    </div>;
                }
            },
            {
                header: t('Country'),
                key: 'country'
            },
            {
                header: t('Price'),
                key: 'price'
            },
            {
                header: t('AvailableSupply'),
                key: 'availableSupply'
            },
            {
                header: t('SupplyTotal'),
                key: 'supply'
            }
        ];
    }
    render(){

        const { t, offerings } = this.props;
        const noResults = offerings.length === 0
            ? <p className='text-warning text-center m-t-20 m-b-20'>{t('common:NoResults')}</p>
            : null;

        return (
            <div className='bootstrap-table bootstrap-table-sortable table-responsive'>
                <SortableTable
                    data={offerings}
                    columns={this.columns}/>

                {noResults}
            </div>
        );
    }
}

export default translated(VPNListTable);
