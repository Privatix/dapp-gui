import * as React from 'react';

// import ChannelToolClose from './channelToolClose';
import ConfirmPopupSwal from '../confirmPopupSwal';
import { translate } from 'react-i18next';

export default translate('channels/channelView')(function(props: any) {
        const { t } = props;

        const warning = t('YouCanNotUndoThis');
        const info = props.channel.receiptBalance === 0
            ? t('TerminateServiceText')
            : t('TerminateServiceAndCloseContract');

        const buttonTitle = props.channel.receiptBalance === 0
            ? t('TerminateService')
            : t('TerminateContract');

        return ['active', 'pending'].includes(props.channel.channelStatus) && props.channel.serviceStatus !== 'terminated'
            ? <div className='col-lg-3 col-md-4'>
                <div className='card m-b-20 card-body text-xs-center warningAreaCard'>
                    <form>
                        <h5 className='card-title'>{t('WarningArea')}</h5>
                        <p className='card-text'>{info}</p>
                        <ConfirmPopupSwal
                            endpoint={`/channels/${props.channel.id}/status`}
                            options={{method: 'put', body: {action: 'terminate'}}}
                            title={buttonTitle}
                            text={<span>{`${info} ${warning}`}</span>}
                            class={'btn btn-danger btn-custom btn-block'}
                            swalType='danger'
                            swalConfirmBtnText={t('YesTerminateIt')}
                            swalTitle={t('AreYouSure')}/>
                    </form>
                </div>
            </div>
            : <div></div>;
    }
);
