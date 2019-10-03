import * as React from 'react';
import { connect } from 'react-redux';
import { withTranslation, Trans } from 'react-i18next';

import ModalWindow from 'common/modalWindow';
import IncreaseDepositView from './increaseDepositView';

import {State} from 'typings/state';

class IncreaseDepositButton extends React.Component<any, any>{

    openIncreaseDepositModal = (evt:any) => {
        evt.preventDefault();
        const { t, render } = this.props;
        render(t('IncreaseDeposit'), <IncreaseDepositView channel={this.props.channel} />);
    }

    render(){

        const { t, render, serviceName, channel } = this.props;

        const increaseDepositView =
            render === undefined ?
                <ModalWindow
                    customClass='btn btn-primary btn-custom btn-block'
                    modalTitle={t('IncreaseDeposit')}
                    text={t('IncreaseDeposit')}
                    component={<IncreaseDepositView channel={channel} />}
                />
                :
                <button className='btn btn-primary btn-custom btn-block' onClick={this.openIncreaseDepositModal}>
                    {t('IncreaseDeposit')}
                </button>
        ;

        return  <div className='card m-b-20 card-body text-xs-center buttonBlock'>
            <p className='card-text'>
                <Trans i18nKey='ThisOperationWillIncrease' values={{serviceName}} >
                    This operation will increase your {{serviceName}} balance by increasing the deposit.
                </Trans>
            </p>
            <div>
                {increaseDepositView}
            </div>
        </div>;
    }
}

export default connect((state: State) => ({serviceName: state.serviceName}))(withTranslation('client/increaseDepositButton')(IncreaseDepositButton));
