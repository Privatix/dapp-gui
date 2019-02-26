import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { translate } from 'react-i18next';

import {asyncProviders} from 'redux/actions';

import { WS } from 'utils/ws';
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
    gasPrice: string;
    dispatch: Dispatch<any>;
    t: any;
    ws: WS;
}

const translated = translate(['offerings/offeringTools', 'confirmPopupSwal', 'utils/notice']);

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
            notice({level: 'error', header: t('utils/notice:Error!'), msg: t('SomethingWentWrong')});
        }
    }

    render(){

        const { t, offering, lastProcessedBlock, removePeriod } = this.props;

        const removePeriodMinutes = Math.floor(removePeriod/4);

        const offeringStatus = offering.status;
        const offeringAge = lastProcessedBlock - offering.blockNumberUpdated;
        const offeringAgeMinutes = Math.floor(offeringAge / 4);

        const disallowDeleting = !['registered', 'popped_up'].includes(offeringStatus);
        const disabled = offeringAge < removePeriod;

        if(disallowDeleting){
            return <div></div>;
        }

        if(disabled) {
            return (
                <div className='card m-b-20 card-body text-xs-center warningAreaCard'>
                    <h5 className='card-title'>{t('WarningArea')}</h5>
                    <p className='card-text'>{t('removeInfo')}</p>
                    <p className='card-text'>{t('removeInfoDisabled', {minutes: removePeriodMinutes, blocks: removePeriod})}</p>
                    <p className='card-text'>{t('lastAction', {lastAction: offeringAge, lastActionMinutes: offeringAgeMinutes})}</p>
                    <p>
                        <button className='btn btn-block btnCustomDisabled disabled'>{t('Remove')}</button>
                    </p>
                </div>
            );
        }

        return (
            <div className='card m-b-20 card-body text-xs-center warningAreaCard'>
                <h5 className='card-title'>{t('WarningArea')}</h5>
                <p className='card-text'>{t('removeInfo')}</p>
                <ConfirmPopupSwal
                    title={t('Remove')}
                    text={<span>{t('removeInfo')}<br />
                        {t('WouldYouLikeToProceed')}</span>}
                    className={'btn btn-danger btn-custom btn-block'}
                    swalType='danger'
                    swalConfirmBtnText={t('YesRemoveIt')}
                    swalTitle={t('confirmPopupSwal:AreYouSure')}
                    done={this.removeOffering}
                />
            </div>
        );

    }
}

const mapStateToProps = (state: State, ownProps: OwnProps) => {
    const settings = state.settings;
    return Object.assign({},
        {
            ws: state.ws
           ,lastProcessedBlock: settings['eth.event.lastProcessedBlock']
           ,removePeriod: settings['psc.periods.remove']
           ,gasPrice: settings['eth.default.gasprice']
        },
        ownProps
    );
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => ({ dispatch});

export default connect(mapStateToProps, mapDispatchToProps)(translated(RemoveOfferingButton));
