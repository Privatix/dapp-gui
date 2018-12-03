import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import {asyncProviders} from '../../redux/actions';

import { WS } from 'utils/ws';
import {State} from 'typings/state';
import {Offering} from 'typings/offerings';

import ConfirmPopupSwal from '../confirmPopupSwal';
import notice from '../../utils/notice';

interface Props {
    offering: Offering;
    lastProcessedBlock?: number;
    gasPrice?: number;
    dispatch: any;
    t: any;
    ws: WS;
    closeModal?: Function;
}

@translate(['offerings/offeringTools', 'confirmPopupSwal', 'utils/notice'])
class OfferingTools extends React.Component<Props, any>{

    constructor(props:any){
        super(props);
    }

    componentDidMount() {
        this.update();
    }

    update(){
        this.props.dispatch(asyncProviders.updateSettings());
    }

    render(){
        const { t, ws, offering, lastProcessedBlock, gasPrice } = this.props;
        // TODO remove with getContractInfo method or something
        const removePeriod = 100;
        const popupPeriod = 500;

        const removePeriodMinutes = Math.floor(removePeriod/4);
        const popupPeriodMinutes = Math.floor(popupPeriod/4);

        const offeringStatus = offering.offerStatus;
        const offeringAge = lastProcessedBlock - offering.blockNumberUpdated;

        const removeInfo = t('removeInfo', {minutes: removePeriodMinutes});
        const disallowDeleting = ['removing', 'popping_up', 'removed'].includes(offeringStatus) || offeringAge < removePeriod;

        const disabledPopUp = !(['registered', 'popped_up'].includes(offeringStatus)) || offeringAge < popupPeriod;
        const popupInfo = disabledPopUp ? t('popupInfoDisabled', {min: popupPeriodMinutes}) : t('popupInfo');

        const doPopup = () => {
            ws.changeOfferingStatus(offering.id, 'popup', gasPrice);
        };

        const doDeactivate = async () => {
            try {
                await ws.changeOfferingStatus(offering.id, 'deactivate', gasPrice);
                notice({
                    level: 'info',
                    header: t('utils/notice:Congratulations!'),
                    msg: t('DeleteOfferingRequestScheduled1') + ' ' + removePeriodMinutes + ' ' + t('DeleteOfferingRequestScheduled2')
                });

                this.props.closeModal();

            } catch (e) {
                notice({level: 'error', header: t('utils/notice:Error!'), msg: t('DeleteOfferingRequestProcessing')});
            }
        };

        const popUpBtn = disabledPopUp ?
            <div>
                <p>
                    <button className='btn btn-block btnCustomDisabled disabled'>{t('Popup')}</button>
                </p>
            </div>
            :
            <ConfirmPopupSwal
                done={doPopup}
                title={t('Popup')}
                text={<span>{popupInfo}</span>}
                class={'btn btn-block btn-primary btn-custom'}
                swalType='warning'
                swalConfirmBtnText={t('YesPopUpIt')}
                swalTitle={t('confirmPopupSwal:AreYouSure')} />;

        const deleteOfferingBl = disallowDeleting ? '' :
            <div className='card m-b-20 card-body text-xs-center warningAreaCard'>
                <h5 className='card-title'>{t('WarningArea')}</h5>
                <p className='card-text'>{removeInfo}</p>
                <ConfirmPopupSwal
                    title={t('Remove')}
                    text={<span>{removeInfo}<br />
                        {t('WouldYouLikeToProceed')}</span>}
                    class={'btn btn-danger btn-custom btn-block'}
                    swalType='danger'
                    swalConfirmBtnText={t('YesRemoveIt')}
                    swalTitle={t('confirmPopupSwal:AreYouSure')}
                    done={doDeactivate}
                />
            </div>;

        return <div className='col-lg-3 col-md-4'>
            <div className='card m-b-20 card-body text-xs-center'>
                <p className='card-text'>{popupInfo}</p>
                {popUpBtn}
            </div>

            {deleteOfferingBl}
        </div>;
    }
}

export default connect( (state: State) => {
    const settings = state.settings;
    return {ws: state.ws, lastProcessedBlock: settings['eth.event.lastProcessedBlock'], gasPrice: settings['eth.default.gasprice']};
} )(OfferingTools);
