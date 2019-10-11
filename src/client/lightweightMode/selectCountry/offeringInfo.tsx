import * as React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import MB from 'common/badges/MB';

import prix from 'utils/prix';

import { State } from 'typings/state';

const translate = withTranslation(['client/simpleMode']);

class OfferingInfo extends React.Component<any, {}> {

    render(){

        const { t, offering, withDeposit, autoIncreaseDeposit, minFirstDeposit } = this.props;

        if(offering){

            const supposedDeposit = offering.unitPrice * offering.minUnits;
            const maxPossibleDeposit = offering.maxUnit ? offering.unitPrice * offering.maxUnit : Infinity;
            const approvedDeposit = autoIncreaseDeposit ? Math.min(maxPossibleDeposit, Math.max(supposedDeposit, minFirstDeposit)) : supposedDeposit;

            const depositMB = approvedDeposit/offering.unitPrice;
            const depositPRIX = prix(approvedDeposit);

            return (
                <table className='table table-sm' style={ {marginLeft: 'auto', marginRight: 'auto', marginTop: '7px', maxWidth: '350px', minWidth: '300px', width: 'auto'} }>
                    <tbody>
                    <tr>
                        <td style={ {border: '0px', textAlign: 'center'} }>{t('PricePerMB')}: </td>
                        <td style={ {border: '0px', whiteSpace: 'nowrap', textAlign: 'center'} }>{`${prix(offering.unitPrice)} PRIX`}</td>
                    </tr>
                    {withDeposit
                        ? <tr>
                             <td style={ {textAlign: 'center'} }>{t('FirstDeposit')}:</td>
                             <td style={ {whiteSpace: 'nowrap', textAlign: 'center'} }><MB amount={depositMB} /> ({depositPRIX} PRIX)
                                 &nbsp;<i className='fa fa-question-circle' title={t('unusedDepositTip')}></i></td>
                         </tr>
                        : null

                    }
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
}))(translate(OfferingInfo));
