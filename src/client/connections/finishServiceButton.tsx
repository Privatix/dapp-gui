import * as React from 'react';
import { translate } from 'react-i18next';

import ConfirmPopupSwal from 'common/confirmPopupSwal';

import { WS, ws } from 'utils/ws';
import { Channel } from 'typings/channels';

interface IProps {
    ws?: WS;
    t?: any;
    channel: Channel;
}

@translate('client/connections/finishServiceButton')

class FinishServiceButton extends React.Component<any, any>{

    done = async () => {
        const { ws, channel } = this.props;
        await ws.changeChannelStatus(channel.id, 'terminate');
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
                disabledBtn={true}
                awaitForDone={true}
            />
        </div>;
    }
}

export default ws<IProps>(FinishServiceButton);
