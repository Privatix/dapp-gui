import * as React from 'react';
import { translate } from 'react-i18next';

import ConfirmPopupSwal from 'common/confirmPopupSwal';
import notice from 'utils/notice';

import { WS, ws } from 'utils/ws';
import { Channel } from 'typings/channels';

interface IProps {
    ws?: WS;
    t?: any;
    channel: Channel;
}

@translate('client/connections/finishServiceButton', 'common', 'utils/notice')
class FinishServiceButton extends React.Component<any, any>{

    done = async () => {
        const { t, ws, channel } = this.props;
        try {
            await ws.changeChannelStatus(channel.id, 'terminate');
            if(this.props.done && 'function' === typeof this.props.done){
                this.props.done();
            }
        } catch ( e ) {
            notice({level: 'error', header: t('utils/notice:Attention!'), msg: t('common:SomethingWentWrong')});
        }
    }

    render(){

        const { t, channel } = this.props;

        return <div className='card m-b-20 card-body text-xs-center buttonBlock'>
            <div>
                <p className='card-text'>{t('PermanentlyStopUsingService')}</p>
                <p className='card-text'>
                    {channel.usage.cost === 0
                        ? t('CanRequestFullDepositReturn')
                        : t('RemainingDepositWillBeReturned')
                    }
                </p>
            </div>
            <ConfirmPopupSwal
                done={this.done}
                title={t('Finish')}
                text={
                    <span>{t('PermanentlyStopUsingService')}<br />
                        {channel.usage.cost === 0
                            ? t('CanRequestFullDepositReturn')
                            : t('RemainingDepositWillBeReturned')
                        }
                    </span>}
                class={'btn btn-primary btn-custom btn-block'}
                swalType='warning'
                swalConfirmBtnText={t('YesFinishIt')}
                swalTitle={t('AreYouSure')}
            />
        </div>;
    }
}

export default ws<IProps>(FinishServiceButton);
