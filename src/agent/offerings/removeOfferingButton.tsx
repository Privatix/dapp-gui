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
    gasPrice?: string;
    dispatch: any;
    t: any;
    ws: WS;
    closeModal?: Function;
}

@translate(['offerings/offeringTools', 'confirmPopupSwal', 'utils/notice'])
class RemoveOfferingButton extends React.Component<Props, any>{

    constructor(props:any){
        super(props);
    }

    componentDidMount() {
        this.update();
    }

    update(){
        this.props.dispatch(asyncProviders.updateSettings());
    }

    removeOffering = async () => {

        const { closeModal, t, ws, offering, removePeriod, gasPrice } = this.props;

        const removePeriodMinutes = Math.floor(removePeriod/4);

        try {
            await ws.changeOfferingStatus(offering.id, 'deactivate', parseInt(gasPrice, 10));
            notice({
                level: 'info',
                header: t('utils/notice:Congratulations!'),
                msg: t('DeleteOfferingRequestScheduled1') + ' ' + removePeriodMinutes + ' ' + t('DeleteOfferingRequestScheduled2')
            });

            closeModal();

        } catch (e) {
            notice({level: 'error', header: t('utils/notice:Error!'), msg: t('DeleteOfferingRequestProcessing')});
        }
    }

    render(){

        const { t, offering, lastProcessedBlock, removePeriod } = this.props;

        const removePeriodMinutes = Math.floor(removePeriod/4);

        const offeringStatus = offering.offerStatus;
        const offeringAge = lastProcessedBlock - offering.blockNumberUpdated;

        const removeInfo = t('removeInfo', {minutes: removePeriodMinutes});
        const disallowDeleting = ['removing', 'popping_up', 'removed'].includes(offeringStatus);
        const disabled = offeringAge < removePeriod;

        

        if(disallowDeleting){
            return <div></div>;
        }

        if(disabled) {
            return (
                <div className='card m-b-20 card-body text-xs-center warningAreaCard'>
                    <h5 className='card-title'>{t('WarningArea')}</h5>
                    <p className='card-text'>{removeInfo}</p>
                    <p>
                        <button className='btn btn-block btnCustomDisabled disabled'>{t('Remove')}</button>
                    </p>
                </div>
            );
        }

        return (
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
                    done={this.removeOffering}
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
       ,removePeriod: settings['psc.periods.remove']
       ,gasPrice: settings['eth.default.gasprice']
    };
} )(RemoveOfferingButton);
