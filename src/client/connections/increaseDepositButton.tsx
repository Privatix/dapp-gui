import * as React from 'react';
import { translate } from 'react-i18next';

import ModalWindow from 'common/modalWindow';
import IncreaseDepositView from './increaseDepositView';

@translate('client/increaseDepositButton')

export default class IncreaseDepositButton extends React.Component<any, any>{

    openIncreaseDepositModal(evt:any) {
        evt.preventDefault();
        const { t, render } = this.props;
        render(t('IncreaseDeposit'), <IncreaseDepositView channel={this.props.channel} />);
    }

    render(){

        const { t, render } = this.props;

        let increaseDepositView = <button className='btn btn-primary btn-custom btn-block' onClick={this.openIncreaseDepositModal.bind(this)}>
            {t('IncreaseDeposit')}
        </button>;

        if (render === undefined) {
            increaseDepositView = <ModalWindow
                customClass='btn btn-primary btn-custom btn-block'
                modalTitle={t('IncreaseDeposit')}
                text={t('IncreaseDeposit')}
                component={<IncreaseDepositView channel={this.props.channel} />}
            />;
        }

        return  <div className='card m-b-20 card-body text-xs-center buttonBlock'>
            <p className='card-text'>{t('ThisOperationWillIncrease')}</p>
            <div>
                {increaseDepositView}
            </div>
        </div>;
    }
}
