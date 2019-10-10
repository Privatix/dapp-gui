import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { WithTranslation, withTranslation } from 'react-i18next';

import ConfirmPopupSwal from 'common/confirmPopupSwal';

import { ClientChannelUsage } from 'typings/channels';
import { State } from 'typings/state';

interface IProps extends WithTranslation {
    channel: State['channel'];
    usage: ClientChannelUsage;
    history?: any;
}

class FinishServiceButton extends React.Component<IProps, {}>{

    done = async () => {
        const { channel } = this.props;
        await channel.terminate();
        this.props.history.push('/');
    }

    render(){

        const { t, usage } = this.props;

        const cost = usage ? usage.cost : 0;

        return <div className='card m-b-20 card-body text-xs-center buttonBlock'>
            <div>
                <p className='card-text'>{t('PermanentlyStopUsingService')}</p>
                <p className='card-text'>
                    {cost === 0
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
                        {cost === 0
                            ? t('CanRequestFullDepositReturn')
                            : t('RemainingDepositWillBeReturned')
                        }
                    </span>}
                className={'btn btn-primary btn-custom btn-block'}
                swalType='warning'
                swalConfirmBtnText={t('YesFinishIt')}
                swalTitle={t('AreYouSure')}
            />
        </div>;
    }
}

export default withRouter(withTranslation('client/connections/finishServiceButton')(FinishServiceButton));
