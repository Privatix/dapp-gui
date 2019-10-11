import * as React from 'react';
import { withTranslation } from 'react-i18next';
import SortableTable from 'react-sortable-table-vilan';

import {
    Availability
    , Block
    , Hash
    , Agent
    , Country
    , IpType
    , Price
    , MaxUnits
    , AvailableSupply
    , Supply
    , Rating
} from 'common/tables/';

const translated = withTranslation(['client/vpnList', 'common']);

class VPNListTable extends React.Component<any,any> {

    get columns(){
        return [
            Availability,
            Block,
            Hash,
            Agent,
            Country,
            IpType,
            Price,
            MaxUnits,
            AvailableSupply,
            Supply,
            Rating
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
