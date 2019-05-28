import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import toFixed from 'utils/toFixedN';

import { State } from 'typings/state';

@translate(['client/simpleMode'])
class OfferingInfo extends React.Component<any, {}> {

    render(){

        const { t, offering, withDeposit, autoIncreaseDeposit, minFirstDeposit } = this.props;

        if(offering){

            const supposedDeposit = offering.unitPrice * offering.minUnits;
            const maxPossibleDeposit = offering.maxUnit ? offering.unitPrice * offering.maxUnit : Infinity;
            const approvedDeposit = autoIncreaseDeposit ? Math.min(maxPossibleDeposit, Math.max(supposedDeposit, minFirstDeposit)) : supposedDeposit;

            const depositMB = toFixed({number: approvedDeposit/offering.unitPrice, fixed: 2});
            const depositPRIX = toFixed({number: approvedDeposit/1e8, fixed: 4});

            return (
                <table className='table table-sm' style={ {margin: 'auto',  width: '300px'} }>
                    <tbody>
                    <tr>
                        <td style={ {border: '0px'} }>{t('PricePerMB')}: </td>
                        <td style={ {border: '0px'} }>{`${toFixed({number: offering.unitPrice/1e8, fixed: 8})} PRIX`}</td>
                    </tr>
                    {withDeposit
                        ? <tr>
                             <td style={ {border: '0px'} }>{t('FirstDeposit')}:</td>
                             <td style={ {border: '0px'} }>{depositMB} MB ({depositPRIX} PRIX) 
                                 <i className='fa fa-question-circle' title={t('unusedDepositTip')}></i></td>
                         </tr>
                        : null

                    }
                    <tr>
                        <td style={ {paddingBottom: '0px'} }>{t('MaxTraffic')}:</td>
                        <td style={ {paddingBottom: '0px'} }>{offering.maxUnit ? `${offering.maxUnit} ${offering.unitName}` : 'unlimited' }</td>
                    </tr>
                    </tbody>
                </table>
            );
        }else{
            return null;
        }
    }
}

export default connect((state: State) => ({
    autoIncreaseDeposit: state.settings['ui.simple.autoincrement.deposit'] === 'true'
   ,minFirstDeposit: parseFloat(state.settings['ui.simple.client.min.deposit'])
}))(OfferingInfo);
