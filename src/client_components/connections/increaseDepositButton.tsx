import * as React from 'react';
import { translate } from 'react-i18next';

import ModalWindow from '../../components/modalWindow';
import IncreaseDepositView from './increaseDepositView';

@translate('client/increaseDepositButton')

export default class TerminateContractButton extends React.Component<any, any>{

    render(){

        const { t } = this.props;

        return  <div className='card m-b-20 card-body text-xs-center'>
                <p className='card-text'>{t('ThisOperationWillIncrease')}</p>
                 { <ModalWindow customClass=''
                                modalTitle={t('IncreaseDeposit')}
                                text={t('IncreaseDeposit')}
                                component={<IncreaseDepositView channel={this.props.channel} />}
                   />}
        </div>;
    }
}
