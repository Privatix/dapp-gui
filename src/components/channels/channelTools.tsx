import * as React from 'react';

// import ChannelToolClose from './channelToolClose';
import ConfirmPopupSwal from '../confirmPopupSwal';
import i18n from '../../i18next/init';

export default function(props:any){

    const warning = i18n.t('channels/channelView:YouCanNotUndoThis');
    const info = props.channel.receiptBalance === 0
        ? i18n.t('channels/channelView:TerminateServiceText')
        : i18n.t('channels/channelView:TerminateServiceAndCloseContract');

    const buttonTitle = props.channel.receiptBalance === 0
        ? i18n.t('channels/channelView:TerminateService')
        : i18n.t('channels/channelView:TerminateContract');

    return ['active', 'pending'].includes(props.channel.channelStatus) && props.channel.serviceStatus !== 'terminated'
        ? <div className='col-lg-3 col-md-4'>
            <div className='card m-b-20 card-body text-xs-center warningAreaCard'>
                <form>
                    <h5 className='card-title'>{i18n.t('channels/channelView:WarningArea')}</h5>
                    <p className='card-text'>{info}</p>
                    <ConfirmPopupSwal
                        endpoint={`/channels/${props.channel.id}/status`}
                        options={{method: 'put', body: {action: 'terminate'}}}
                        title={buttonTitle}
                        text={<span>{`${info} ${warning}`}</span>}
                        class={'btn btn-danger btn-custom btn-block'}
                        swalType='danger'
                        swalConfirmBtnText={i18n.t('channels/channelView:YesTerminateIt')}
                        swalTitle={i18n.t('channels/channelView:AreYouSure')} />
                </form>
            </div>
        </div>
        :<div></div>;
}
