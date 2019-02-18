import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import ConfirmPopupSwal from 'common/confirmPopupSwal';

import { State } from 'typings/state';

@translate('channels/channelView')
class ChannelTools extends React.Component<any, any>{

    constructor(props: any) {
        super(props);
    }

    render(){

        const { t, ws, channel } = this.props;

        const warning = t('YouCanNotUndoThis');
        const info = channel.receiptBalance === 0
            ? t('TerminateServiceText')
            : t('TerminateServiceAndCloseContract');

        const buttonTitle = channel.receiptBalance === 0
            ? t('TerminateService')
            : t('TerminateContract');

        const done = () => {
            ws.changeChannelStatus(channel.id, 'terminate');
        };

        return ['active', 'pending'].includes(channel.channelStatus) && channel.serviceStatus !== 'terminated'
            ? <div className='col-lg-3 col-md-4'>
                <div className='card m-b-20 card-body text-xs-center warningAreaCard'>
                    <form>
                        <h5 className='card-title'>{t('WarningArea')}</h5>
                        <p className='card-text'>{info}</p>
                        <ConfirmPopupSwal
                            done={done}
                            title={buttonTitle}
                            text={<span>{`${info} ${warning}`}</span>}
                            className={'btn btn-danger btn-custom btn-block'}
                            swalType='danger'
                            swalConfirmBtnText={t('YesTerminateIt')}
                            swalTitle={t('AreYouSure')}/>
                    </form>
                </div>
            </div>
            : <div></div>;
    }
}

export default connect((state: State) => ({ws: state.ws}))(ChannelTools);
