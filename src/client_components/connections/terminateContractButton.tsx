import * as React from 'react';
import ConfirmPopupSwal from '../../components/confirmPopupSwal';
import { translate } from 'react-i18next';

@translate('client/terminateContractBlock')

export default class TerminateContractButton extends React.Component<any, any>{

    render(){
        const { t } = this.props;

        return this.props.status === 'disabled'
            ? <div className='card m-b-20 card-body text-xs-center warningAreaCard'>
                <span>{t('ToOpenDisputeFinishService')}</span><br />
                <button className='btn btn-danger btn-custom btn-block disabled' >{t('TerminateContract')}</button>
              </div>
            : <div className='card m-b-20 card-body text-xs-center warningAreaCard'>
                <form>
                    <h5 className='card-title'>{t('WarningArea')}</h5>
                    <p className='card-text'>{t('RequestFullDepositReturn')}</p>
                    <p className='card-text'>{t('UseIfAgentDoNotCloseContract')}<br />
                        {t('YouPayMultipleTransactionFees')}</p>
                    <ConfirmPopupSwal
                        endpoint={`/client/channels/${this.props.channelId}/status`}
                        options={{method: 'put', body: {action: 'close'}}}
                        title={t('TerminateContract')}
                        text={<span>{t('RequestFullDepositReturn')}<br />
                            {t('UseIfAgentDoNotCloseContract')}<br />
                            {t('YouPayMultipleTransactionFees')}
                        </span>}
                        class={'btn btn-danger btn-custom btn-block'}
                        swalType='danger'
                        swalConfirmBtnText={t('YesTerminateContract')}
                        swalTitle={t('AreYouSure')}
                        done={this.props.done} />
                </form>
            </div>;
    }
}
