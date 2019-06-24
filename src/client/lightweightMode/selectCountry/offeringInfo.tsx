import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import Traffic from 'common/badges/traffic';

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
            const depositPRIX = toFixed({number: approvedDeposit/1e8, fixed: 8, significant: 2});

            return (
                <table className='table table-sm' style={ {marginLeft: 'auto', marginRight: 'auto', marginTop: '7px', maxWidth: '350px', minWidth: '300px', width: 'auto'} }>
                    <tbody>
                    <tr>
                        <td style={ {border: '0px', textAlign: 'left'} }>{t('PricePerMB')}: </td>
                        <td style={ {border: '0px', whiteSpace: 'nowrap', textAlign: 'center'} }>{`${toFixed({number: offering.unitPrice/1e8, fixed: 8, significant: 2})} PRIX`}</td>
                    </tr>
                    {withDeposit
                        ? <tr>
                             <td style={ {textAlign: 'left'} }>{t('FirstDeposit')}:</td>
                             <td style={ {whiteSpace: 'nowrap', textAlign: 'center'} }><Traffic amount={parseFloat(depositMB)} /> ({depositPRIX} PRIX)
                                 &nbsp;<i className='fa fa-question-circle' title={t('unusedDepositTip')}></i></td>
                         </tr>
                        : null

                    }
                    <tr>
                        <td style={ {paddingBottom: '0px', textAlign: 'left'} }>{t('MaxTraffic')}:</td>
                        <td style={ {paddingBottom: '0px', textAlign: 'center'} }>{offering.maxUnit ? <Traffic amount={offering.maxUnit} /> : 'unlimited' }</td>
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
    autoIncreaseDeposit: state.settings['client.autoincrease.deposit'] === 'true'
   ,minFirstDeposit: parseFloat(state.settings['client.min.deposit'])
}))(OfferingInfo);
