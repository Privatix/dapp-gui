import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { translate } from 'react-i18next';

import {asyncProviders} from 'redux/actions';

import eth from 'utils/eth';

import {State} from 'typings/state';
import {Offering} from 'typings/offerings';

import ConfirmPopupSwal from 'common/confirmPopupSwal';
import notice from 'utils/notice';

interface OwnProps {
    offering: Offering;
    closeModal: Function;
}

interface Props extends OwnProps {
    lastProcessedBlock: number;
    removePeriod: number;
    popupPeriod: number;
    localSettings: State['localSettings'];
    accounts: State['accounts'];
    dispatch: Dispatch<any>;
    t: any;
    ws: State['ws'];
}

const translated = translate(['offerings/offeringTools', 'confirmPopupSwal', 'utils/notice', 'utils/gasRange']);

class PopupOfferingButton extends React.Component<Props, any>{

    constructor(props:any){
        super(props);
        this.state = { gasPrice: 1 };
    }

    async componentDidMount() {

        const { ws } = this.props;

        try {
            const gasPrice = await ws.suggestGasPrice();
            this.setState({gasPrice});
        }catch(e){
            // DO NOTHING
        }

        this.update();
    }

    update(){
        this.props.dispatch(asyncProviders.updateSettings());
    }

    popupOffering = async () => {

        const { closeModal, ws, t, offering, accounts, localSettings } = this.props;
        const { gasPrice } = this.state;

        const account = accounts.find(account => account.isDefault);

        if(account.ethBalance < localSettings.gas.popupOffering*gasPrice){
            notice({level: 'error', header: t('utils/notice:Attention!'), msg: t('ErrorNotEnoughPublishFunds')});
            return;
        }
        try {
            await ws.changeOfferingStatus(offering.id, 'popup', gasPrice);
            notice({
                level: 'info',
                header: t('utils/notice:Congratulations!'),
                msg: t('popupNotice')
            });
            closeModal();
        } catch (e) {
            notice({level: 'error', header: t('utils/notice:Error!'), msg: t('SomethingWentWrong')});
        }

    }

    render(){

        const { t, offering, lastProcessedBlock, popupPeriod, localSettings } = this.props;
        const { gasPrice } = this.state;

        const popupPeriodMinutes = Math.floor(popupPeriod/4);

        const offeringStatus = offering.status;
        const offeringAge = lastProcessedBlock - offering.blockNumberUpdated;

        const showPopUp = ['registered', 'popped_up'].includes(offeringStatus);
        const disabled =  offeringAge < popupPeriod;
        const popupInfo = disabled ? t('popupInfoDisabled', {min: popupPeriodMinutes, blocks: popupPeriod, lastAction: offeringAge}) : t('popupInfo');

        if(!showPopUp){
            return <div></div>;
        }

        if(disabled){
            return (
                <div className='card m-b-20 card-body text-xs-center'>
                    <p className='card-text'>{t('popupInfo')}</p>
                    <p className='card-text'>{t('popupInfoDisabled', {min: popupPeriodMinutes, blocks: popupPeriod})}</p>
                    <p className='card-text'>{t('lastActionPopup', {lastAction: offeringAge})}</p>
                    <span>{t('utils/gasRange:TransactionFee')} {eth(localSettings.gas.popupOffering*gasPrice)} ETH</span><br />
                    <p>
                        <button className='btn btn-block btnCustomDisabled disabled'>{t('Popup')}</button>
                    </p>
                </div>
            );

        }

        return (
            <div className='card m-b-20 card-body text-xs-center'>
                <p className='card-text'>{t('popupInfo')}</p>
                <span>{t('utils/gasRange:TransactionFee')} {eth(localSettings.gas.popupOffering*gasPrice)} ETH</span><br />
                <ConfirmPopupSwal
                    done={this.popupOffering}
                    title={t('Popup')}
                    text={<span>{popupInfo}</span>}
                    className={'btn btn-block btn-primary btn-custom'}
                    swalType='warning'
                    swalConfirmBtnText={t('YesPopUpIt')}
                    swalTitle={t('confirmPopupSwal:AreYouSure')}
                />
            </div>
        );
    }
}

const mapStateToProps = (state: State, ownProps: OwnProps) => {
    const {ws, settings, localSettings, accounts } = state;
    return Object.assign({},
        {
            ws
           ,lastProcessedBlock: settings['eth.event.lastProcessedBlock']
           ,popupPeriod: settings['psc.periods.popup']
           ,localSettings
           ,accounts
        },
        ownProps
    );
};


const mapDispatchToProps = (dispatch: Dispatch<any>) => ({ dispatch});

export default connect(mapStateToProps, mapDispatchToProps)(translated(PopupOfferingButton));
