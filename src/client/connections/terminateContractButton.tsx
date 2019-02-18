import * as React from 'react';
import { translate } from 'react-i18next';

import ConfirmPopupSwal from 'common/confirmPopupSwal';

import { WS, ws } from 'utils/ws';

interface IProps {
    ws?: WS;
    t?: any;
    status: string;
    payment: any;
    channelId: string;
    done: Function;
}

@translate('client/terminateContractBlock')
class TerminateContractButton extends React.Component<IProps, any>{

    done = () => {
        const { ws, channelId } = this.props;
        ws.changeChannelStatus(channelId, 'close');
        if(this.props.done && 'function' === typeof this.props.done){
            this.props.done();
        }
    }

    render(){

        const { t } = this.props;

        return this.props.status === 'disabled'
            ? <div className='card m-b-20 card-body text-xs-center warningAreaCard'>
                <span>{t('ToOpenDisputeFinishService')}</span><br />
                <button className='btn btnCustomDisabled btn-block disabled' >{t('TerminateContract')}</button>
              </div>
            : <div className='card m-b-20 card-body text-xs-center warningAreaCard'>
                <form>
                    <h5 className='card-title'>{t('WarningArea')}</h5>
                    <p className='card-text'>{t('RequestFullDepositReturn')}</p>
                    {this.props.payment
                        ? <p className='card-text'>
                            {t('UseIfAgentDoNotCloseContract')}<br />
                            {t('YouPayMultipleTransactionFees')}
                          </p>
                        : ''
                    }
                    <ConfirmPopupSwal
                        title={t('TerminateContract')}
                        text={<span>{t('RequestFullDepositReturn')}<br />
                            {this.props.payment
                                ? <span>
                                    {t('UseIfAgentDoNotCloseContract')}<br />
                                    {t('YouPayMultipleTransactionFees')}
                                </span>
                                : ''
                            }
                        </span>}
                        className={'btn btn-danger btn-custom btn-block'}
                        swalType='danger'
                        swalConfirmBtnText={t('YesTerminateContract')}
                        swalTitle={t('AreYouSure')}
                        done={this.done} />
                </form>
            </div>;
    }
}

export default ws<IProps>(TerminateContractButton);
