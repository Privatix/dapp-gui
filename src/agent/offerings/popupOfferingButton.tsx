import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import {asyncProviders} from 'redux/actions';

import { WS } from 'utils/ws';
import {State} from 'typings/state';
import {Offering} from 'typings/offerings';

import ConfirmPopupSwal from 'common/confirmPopupSwal';
import notice from 'utils/notice';

interface Props {
    offering: Offering;
    lastProcessedBlock?: number;
    removePeriod?: number;
    popupPeriod?: number;
    gasPrice?: string;
    dispatch: any;
    t: any;
    ws: WS;
    closeModal?: Function;
}

@translate(['offerings/offeringTools', 'confirmPopupSwal', 'utils/notice'])
class PopupOfferingButton extends React.Component<Props, any>{

    constructor(props:any){
        super(props);
    }

    componentDidMount() {
        this.update();
    }

    update(){
        this.props.dispatch(asyncProviders.updateSettings());
    }

    popupOffering = async () => {

        const { closeModal, ws, t, offering, gasPrice } = this.props;

        try {
            await ws.changeOfferingStatus(offering.id, 'popup', parseInt(gasPrice, 10));
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

        const { t, offering, lastProcessedBlock, popupPeriod } = this.props;

        const popupPeriodMinutes = Math.floor(popupPeriod/4);

        const offeringStatus = offering.offerStatus;
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
                    <p className='card-text'>{popupInfo}</p>
                    <p>
                        <button className='btn btn-block btnCustomDisabled disabled'>{t('Popup')}</button>
                    </p>
                </div>
            );

        }

        return (
            <div className='card m-b-20 card-body text-xs-center'>
                <p className='card-text'>{popupInfo}</p>
                <ConfirmPopupSwal
                    done={this.popupOffering}
                    title={t('Popup')}
                    text={<span>{popupInfo}</span>}
                    class={'btn btn-block btn-primary btn-custom'}
                    swalType='warning'
                    swalConfirmBtnText={t('YesPopUpIt')}
                    swalTitle={t('confirmPopupSwal:AreYouSure')}
                />
            </div>
        );
    }
}

export default connect( (state: State) => {
    const settings = state.settings;
    return {
        ws: state.ws
       ,lastProcessedBlock: settings['eth.event.lastProcessedBlock']
       ,popupPeriod: settings['psc.periods.popup']
       ,gasPrice: settings['eth.default.gasprice']
    };
} )(PopupOfferingButton);
