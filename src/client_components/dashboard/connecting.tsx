import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import Countdown from 'react-countdown-now';

import ConfirmPopupSwal from '../../components/confirmPopupSwal';
import ActiveConnection from '../connections/active';
import notice from '../../utils/notice';
import * as api from '../../utils/api';
import FinishServiceButton from '../connections/finishServiceButton';

const countdownRender = ({ minutes, seconds }) => {
    return <span>{minutes}:{seconds}</span>;
};

const completeRemaining = translate('client/dashboard/connecting')(({t}) => {
    return <span>{t('WaitingTimeIsOver')}</span>;
});

@translate(['client/dashboard/connecting', 'utils/notice', 'confirmPopupSwal'])
class Connecting extends React.Component<any, any>{

    constructor(props:any){
        super(props);
        this.state = {status: 'pending', handler: 0, channels: [], pendingTimeCounter: 0};
    }

    componentDidMount(){
        this.refresh();
    }

    componentWillUnmount(){
        if(this.state.handler !== 0){
            clearTimeout(this.state.handler);
        }
    }

    async refresh(){

        const { t } = this.props;

        const pendingChannelsReq = api.channels.getClientList(null, 'pending');
        const activeChannelsReq = api.channels.getClientList(null, 'active');
        const suspendedChannelsReq = api.channels.getClientList(null, 'suspended');

        const [pendingChannels, activeChannels, suspendedChannels] = await Promise.all([
            pendingChannelsReq,
            activeChannelsReq,
            suspendedChannelsReq
        ]);

        if((activeChannels as any).length > 0){
            this.setState({status: 'active', channels: activeChannels});
        }else if((suspendedChannels as any).length > 0){
            const channel = suspendedChannels[0];

            if(channel.usage.current > 0){
                this.setState({status: 'paused', channels: suspendedChannels});
            }else{
                this.setState({status: 'suspended', channels: suspendedChannels});
            }
        }else if((pendingChannels as any).length > 0){
            this.setState({status: 'pending', channels: pendingChannels});
        } else {
            let pendingTimeCounter = this.state.pendingTimeCounter + 1;

            if (pendingTimeCounter >= 20) {
                clearTimeout(this.state.handler);
                notice({level: 'error', title: t('utils/notice:Attention!'), msg: t('FailedToAcceptOffering')}, 5000);
                this.props.history.push('/client-dashboard-start');
                return;
            }

            this.setState({status: 'pending', channels: pendingChannels, pendingTimeCounter});
        }

        this.setState({handler: setTimeout(this.refresh.bind(this), 3000)});
    }

    pending(){

        const { t } = this.props;

        return <div className='container-fluid'>
            <div className='row m-t-20'>
                <div className='col-5'>
                    <div className='card m-b-20 card-body'>
                        <p className='card-text'>{t('AfterTheConnectionIsReady')}</p>
                        <button className='btn btn-inverse btn-block btn-lg disabled'>
                            <span className='loadingIconBl'><i className='fa fa-spin fa-refresh'></i></span>{t('Synchronizing')}...
                        </button>
                    </div>
                </div>
            </div>
            <ActiveConnection channels={this.state.channels}/>
        </div>;
    }

    suspended(){

        const { t } = this.props;

        return <div className='container-fluid'>
            <div className='row m-t-20'>
                <div className='col-5'>
                    <div className='card m-b-20 card-body'>
                        <p className='card-text m-t-5 m-b-20'><strong>{t('YouCanStartUsingVPN')}</strong></p>
                        <ConfirmPopupSwal
                            endpoint={`/client/channels/${this.state.channels[0].id}/status`}
                            options={{method: 'put', body: {action: 'resume'}}}
                            title={t('Connect')}
                            text={<span></span>}
                            class={'btn btn-primary btn-custom btn-block'}
                            swalType='warning'
                            swalConfirmBtnText={t('YesConnectIt')}
                            swalTitle={t('confirmPopupSwal:AreYouSure')} />
                    </div>
                </div>

                <div className='col-2'></div>

                <div className='col-5'>
                    <FinishServiceButton channel={this.state.channels[0]} />
                </div>

            </div>

            <ActiveConnection channels={this.state.channels}/>
        </div>;
    }

    active(){

        const { t } = this.props;

        return <div className='container-fluid'>
            <div className='row m-t-20'>
                <div className='col-5'>
                    <div className='card m-b-20 card-body'>
                        <p className='card-text'>{t('ThisOperationWillPauseVPNUsage')}</p>
                        { /* TODO insert real max suspend time */ }
                        <p className='card-text m-t-5 m-b-20'>{t('ForThisContractMaxSuspendTimeIs', {minutes: 12})}</p>
                        <ConfirmPopupSwal
                            endpoint={`/client/channels/${this.state.channels[0].id}/status`}
                            options={{method: 'put', body: {action: 'pause'}}}
                            title={'Pause'}
                            text={<span>{t('ThisOperationWillPauseVPNUsage')}<br />
                            {t('ForThisContractMaxSuspendTimeIs')}</span>}
                            class={'btn btn-primary btn-custom btn-block'}
                            swalType='warning'
                            swalConfirmBtnText={t('YesPauseIt')}
                            swalTitle={t('confirmPopupSwal:AreYouSure')} />
                    </div>
                </div>

                <div className='col-5'>
                    <FinishServiceButton channel={this.state.channels[0]} />
                </div>
            </div>

            <ActiveConnection channels={this.state.channels}/>
        </div>;
    }

    paused(){

        const { t } = this.props;

        return <div className='container-fluid'>
            <div className='row m-t-20'>
                <div className='col-5'>
                    <div className='card m-b-20 card-body'>
                        <p className='card-text remainingText'>{t('Remaining')}:
                            <strong>
                                <Countdown date={Date.parse(this.state.channels[0].channelStatus.lastChanged) + this.state.channels[0].channelStatus.maxInactiveTime*1000}
                                           renderer={countdownRender}
                                           onComplete={completeRemaining}
                                />
                            </strong> min
                        </p>
                        <p className='card-text m-t-5 m-b-20 text-muted'>{t('AfterMaxInactivityTimeHasBeenReached')}</p>
                        <ConfirmPopupSwal
                            endpoint={`/client/channels/${this.state.channels[0].id}/status`}
                            options={{method: 'put', body: {action: 'resume'}}}
                            title={t('Resume')}
                            text={<span></span>}
                            class={'btn btn-primary btn-custom btn-block'}
                            swalType='warning'
                            swalConfirmBtnText={t('YesResumeIt')}
                            swalTitle={t('confirmPopupSwal:AreYouSure')} />
                    </div>
                </div>

                <div className='col-2'></div>

                <div className='col-5'>
                    <FinishServiceButton channel={this.state.channels[0]} />
                </div>
            </div>

            <ActiveConnection channels={this.state.channels}/>
        </div>;
    }

    render(){
        return this[this.state.status]();
    }
}

export default withRouter(Connecting);
