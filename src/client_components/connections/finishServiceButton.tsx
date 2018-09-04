import * as React from 'react';
import ConfirmPopupSwal from '../../components/confirmPopupSwal';
import { translate } from 'react-i18next';

@translate('client/connections/finishServiceButton')

export default class FinishServiceButton extends React.Component<any, any>{

    render(){
        const { t } = this.props;

        return <div className='card m-b-20 card-body text-xs-center'>
                <form>
                    <p className='card-text'>{t('PermanentlyStopUsingService')}</p>
                    <p className='card-text'>
                        {this.props.channel.usage.cost === 0
                            ? t('CanRequestFullDepositReturn')
                            : t('RemainingDepositWillBeReturned')
                        }
                    </p>
                    <ConfirmPopupSwal
                        endpoint={`/client/channels/${this.props.channel.id}/status`}
                        options={{method: 'put', body: {action: 'terminate'}}}
                        title={t('Finish')}
                        text={
                            <span>{t('PermanentlyStopUsingService')}<br />
                                {this.props.channel.usage.cost === 0
                                    ? t('CanRequestFullDepositReturn')
                                    : t('RemainingDepositWillBeReturned')
                                }
                            </span>}
                        class={'btn btn-primary btn-custom btn-block'}
                        swalType='warning'
                        swalConfirmBtnText={t('YesFinishIt')}
                        swalTitle={t('AreYouSure')} />
                </form>
            </div>;
    }
}
