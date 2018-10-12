import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import {asyncProviders} from '../../redux/actions';
import {State} from '../../typings/state';
import {Offering} from '../../typings/offerings';

import ConfirmPopupSwal from '../confirmPopupSwal';
import notice from '../../utils/notice';

interface Props {
    offering: Offering;
    challengePeriod: number;
    dispatch: any;
    t: any;
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
        const { t } = this.props;
        const offeringStatus = this.props.offering.offerStatus;
        const challengePeriodMinutes = Math.floor(this.props.challengePeriod / 4);
        const removeInfo = t('removeInfo', {minutes: challengePeriodMinutes});
        const disallowDeleting = ['removing', 'popping_up', 'removed'].includes(offeringStatus);

        const disabledPopUp = !(['registered', 'popped_up'].includes(offeringStatus));
        const popupInfo = disabledPopUp ? t('popupInfoDisabled', {min: challengePeriodMinutes}) : t('popupInfo');
        const popUpBtn = disabledPopUp ?
            <div>
                <p>
                    <button className='btn btn-block btnCustomDisabled disabled'>{t('Popup')}</button>
                </p>
            </div>
            :
            <ConfirmPopupSwal
                endpoint={`/offerings/${this.props.offering.id}/status`}
                options={{method: 'put', body: {action: 'popup'}}}
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
                    endpoint={`/offerings/${this.props.offering.id}/status`}
                    options={{method: 'put', body: {action: 'deactivate'}}}
                    title={t('Remove')}
                    text={<span>{removeInfo}<br />
                        {t('WouldYouLikeToProceed')}</span>}
                    class={'btn btn-danger btn-custom btn-block'}
                    swalType='danger'
                    swalConfirmBtnText={t('YesRemoveIt')}
                    swalTitle={t('confirmPopupSwal:AreYouSure')}
                    done={(res) => {
                        if (res.code === 0) {
                            notice({level: 'error', header: t('utils/notice:Error!'), msg: t('DeleteOfferingRequestProcessing')});
                        } else {
                            notice({
                                level: 'info',
                                header: t('utils/notice:Congratulations!'),
                                msg: t('DeleteOfferingRequestScheduled1') + ' ' + challengePeriodMinutes + ' ' + t('DeleteOfferingRequestScheduled2')
                            });

                            this.props.closeModal();
                        }
                    }} />
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
    return {challengePeriod: settings['eth.challenge.period'] ? parseInt(settings['eth.challenge.period'].value, 10) : 0};
} )(OfferingTools);
