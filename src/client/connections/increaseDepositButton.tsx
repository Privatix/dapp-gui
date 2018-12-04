import * as React from 'react';
import { translate } from 'react-i18next';

import ModalWindow from 'common/modalWindow';
import IncreaseDepositView from './increaseDepositView';

@translate('client/increaseDepositButton')

export default class IncreaseDepositButton extends React.Component<any, any>{

    render(){

        const { t } = this.props;

        return  <div className='card m-b-20 card-body text-xs-center buttonBlock'>
            <p className='card-text'>{t('ThisOperationWillIncrease')}</p>
            <div>
                <ModalWindow customClass='btn btn-primary btn-custom btn-block'
                             modalTitle={t('IncreaseDeposit')}
                             text={t('IncreaseDeposit')}
                             component={<IncreaseDepositView channel={this.props.channel} />}
                />
            </div>
        </div>;
    }
}
