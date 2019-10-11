import * as React from 'react';
import { connect } from 'react-redux';
import { WithTranslation, withTranslation } from 'react-i18next';

import ConfirmPopupSwal from 'common/confirmPopupSwal';
import eth from 'utils/eth';

import { State } from 'typings/state';

interface IProps extends WithTranslation {
    ws?: State['ws'];
    status: string;
    payment: any;
    channelId: string;
    done: Function;
    transactionFee?: number;
    localSettings?: State['localSettings'];
}

interface IState {
    gasPrice: number;
}

class TerminateContractButton extends React.Component<IProps, IState>{

    constructor(props: IProps){
        super(props);
        this.state = {gasPrice: props.localSettings.gas.defaultGasPrice};
    }

    async componentDidMount(){

        const { ws } = this.props;

        try {
            const gasPrice = await ws.suggestGasPrice();
            if(typeof gasPrice === 'number' && gasPrice !== 0){
                this.setState({gasPrice});
            }
        }catch(e){
            // DO NOTHING
        }
    }

    done = () => {
        const { ws, channelId } = this.props;
        ws.changeChannelStatus(channelId, 'close');
        if(this.props.done && 'function' === typeof this.props.done){
            this.props.done();
        }
    }

    render(){

        const { t, status, payment, transactionFee } = this.props;
        const { gasPrice } = this.state;

        return status === 'disabled'
            ? <div className='card m-b-20 card-body text-xs-center warningAreaCard'>
                <span>{t('ToOpenDisputeFinishService')}</span><br />
                <span>{t('utils/gasRange:TransactionFee')} {eth(transactionFee*gasPrice)} ETH</span><br />
                <button className='btn btnCustomDisabled btn-block disabled' >{t('TerminateContract')}</button>
              </div>
            : <div className='card m-b-20 card-body text-xs-center warningAreaCard'>
                <form>
                    <h5 className='card-title'>{t('WarningArea')}</h5>
                    <p className='card-text'>{t('RequestFullDepositReturn')}</p>
                    <span>{t('utils/gasRange:TransactionFee')} {eth(transactionFee*gasPrice)} ETH</span><br />
                    {payment
                        ? <p className='card-text'>
                            {t('UseIfAgentDoNotCloseContract')}<br />
                          </p>
                        : null
                    }
                    <ConfirmPopupSwal
                        title={t('TerminateContract')}
                        text={<span>{t('RequestFullDepositReturn')}<br />
                            {payment
                                ? <span>
                                    {t('UseIfAgentDoNotCloseContract')}<br />
                                    <span>{t('utils/gasRange:TransactionFee')} {eth(transactionFee*gasPrice)} ETH</span><br />
                                </span>
                                : null
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

export default connect((state: State) => ({
     ws: state.ws
    ,localSettings: state.localSettings
    ,transactionFee: state.localSettings.gas.terminateContract
}))(withTranslation(['client/terminateContractBlock', 'utils/gasRange'])(TerminateContractButton));
