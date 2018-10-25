import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import Countdown from 'react-countdown-now';

import ActiveConnection from '../connections/active';
import FinishServiceButton from '../connections/finishServiceButton';
import IncreaseDepositButton from '../connections/increaseDepositButton';

import ConfirmPopupSwal from '../../components/confirmPopupSwal';
import notice from '../../utils/notice';
// import * as api from '../../utils/api';
import { State } from '../../typings/state';

const countdownRender = ({ minutes, seconds }) => {
    return <span>{minutes}:{seconds}</span>;
};

const completeRemaining = translate('client/dashboard/connecting')(({t}) => {
    return <span>{t('WaitingTimeIsOver')}</span>;
});

@translate(['client/dashboard/connecting', 'utils/notice', 'confirmPopupSwal'])
class Connecting extends React.Component<any, any>{

    subscription: String;

    constructor(props:any) {
        super(props);
        this.state = {
            status: 'pending',
            handler: 0,
            channels: [],
            pendingTimeCounter: 0,
            offering: null,
            countryAlert: ''
        };
    }

    componentDidMount() {
        this.refresh();
    }

    componentWillUnmount() {

        const { ws } = this.props;

        if(this.state.handler !== 0){
            clearTimeout(this.state.handler);
        }

        if(this.subscription){
            ws.unsubscribe(this.subscription);
        }
    }

    ws = (event: any) => {
        console.log('WS event catched!!!!', event);
        this.refresh();
    }

    async refresh() {

        const { t, ws } = this.props;

        const pendingChannelsReq = ws.getClientChannels('active', 'pending', 0, 10);
        const activeChannelsReq = ws.getClientChannels('active', 'active', 0, 10);
        const suspendedChannelsReq = ws.getClientChannels('active', 'suspended', 0, 10);

        const [pendingChannels, activeChannels, suspendedChannels] = await Promise.all([
            pendingChannelsReq,
            activeChannelsReq,
            suspendedChannelsReq]);

        if(!this.subscription){
            // TODO remove
            if(!pendingChannels.items){
                pendingChannels.items = [];
            }
            if(!activeChannels.items){
                activeChannels.items = [];
            }
            if(!suspendedChannels.items){
                suspendedChannels.items = [];
            }
            const ids = [...pendingChannels.items, ...activeChannels.items, ...suspendedChannels.items].map(channel => channel.id);
            if(ids.length){
                this.subscription = ws.subscribe('channel', ids, this.ws);
            }
        }

        if(activeChannels.items.length > 0){
            const offering = await ws.getOffering(activeChannels.items[0].offering);
            this.setState({status: 'active', channels: activeChannels.items, offering});

        }else if(suspendedChannels.items.length > 0){
            const channel = suspendedChannels.items[0];

            let countryAlert = '';
            const endpoint = await ws.getEndpoints(channel.id);
            if (endpoint[0]) {
                const ip = endpoint[0].serviceEndpointAddress;
                const countryStatus = endpoint[0].countryStatus;
                if (countryStatus === 'invalid') {
                    countryAlert = t('CountryAlertInvalid', {ip: ip});
                } else if (countryStatus === 'unknown') {
                    countryAlert = t('CountryAlertUnknown', {ip: ip});
                }
            }

            if(channel.usage.current > 0){
                this.setState({status: 'paused', channels: suspendedChannels.items});
            }else{
                this.setState({status: 'suspended', channels: suspendedChannels.items, countryAlert});
            }
        }else if(pendingChannels.items.length > 0){
            this.setState({status: 'pending', channels: pendingChannels.items});
        } else {
            let pendingTimeCounter = this.state.pendingTimeCounter + 1;

            if (pendingTimeCounter >= 20) {
                clearTimeout(this.state.handler);
                notice({level: 'error', title: t('utils/notice:Attention!'), msg: t('FailedToAcceptOffering')}, 5000);
                this.props.history.push('/client-dashboard-start');
                return;
            }

            this.setState({status: 'pending', channels: pendingChannels.items, pendingTimeCounter});
        }

        if(!this.subscription){
            this.setState({handler: setTimeout(this.refresh.bind(this), 3000)});
        }

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

        const countryAlert = this.state.countryAlert === '' ? '' :
            <div className='alert alert-warning clientCountryAlert'>{this.state.countryAlert}</div>;

        return <div className='container-fluid'>
            <div className='row m-t-20'>
                <div className='col-6 col-xl-5 clientConnectionBl'>
                    <div className='card m-b-20 card-body buttonBlock'>
                        <p className='card-text m-t-5'><strong>{t('YouCanStartUsingVPN')}</strong></p>
                        {countryAlert}
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

                <div className='col-0 col-xl-2'></div>

                <div className='col-6 col-xl-5 clientConnectionBl'>
                    <FinishServiceButton channel={this.state.channels[0]} />
                </div>

            </div>

            <ActiveConnection channels={this.state.channels}/>
        </div>;
    }

    active(){

        const { t } = this.props;

        return <div className='container-fluid'>
            <div className='row m-t-20 clientConnectionBl'>
                <div className='col-4 col-xl-4 buttonBlock'>
                    <IncreaseDepositButton channel={this.state.channels[0]} />
                </div>
                <div className='col-4 col-xl-4 buttonBlock'>
                    <div className='card m-b-20 card-body buttonBlock'>
                        <p className='card-text'>{t('ThisOperationWillPauseVPNUsage')}</p>
                        { /* TODO insert real max suspend time */ }
                        <p className='card-text'>{t('ForThisContractMaxSuspendTimeIs', {minutes: Math.ceil(this.state.offering.maxSuspendTime / 60)})}</p>
                        <ConfirmPopupSwal
                            endpoint={`/client/channels/${this.state.channels[0].id}/status`}
                            options={{method: 'put', body: {action: 'pause'}}}
                            title={t('Pause')}
                            text={<span>{t('ThisOperationWillPauseVPNUsage')}<br />
                            {t('ForThisContractMaxSuspendTimeIs')}</span>}
                            class={'btn btn-primary btn-custom btn-block'}
                            swalType='warning'
                            swalConfirmBtnText={t('YesPauseIt')}
                            swalTitle={t('confirmPopupSwal:AreYouSure')} />
                    </div>
                </div>

                <div className='col-4 col-xl-4 buttonBlock'>
                    <FinishServiceButton channel={this.state.channels[0]} />
                </div>
            </div>

            <ActiveConnection channels={this.state.channels}/>
        </div>;
    }

    paused(){

        const { t } = this.props;

        return <div className='container-fluid'>
            <div className='row m-t-20 clientConnectionBl'>
                <div className='col-6 col-xl-5'>
                    <div className='card m-b-20 card-body'>
                        <p className='card-text remainingText'>{t('Remaining')}:&nbsp;
                            <strong>
                                <Countdown date={Date.parse(this.state.channels[0].channelStatus.lastChanged) + this.state.channels[0].channelStatus.maxInactiveTime*1000}
                                           renderer={countdownRender}
                                           onComplete={completeRemaining}
                                />
                            </strong> {t('min')}
                        </p>
                        <p className='card-text text-muted'>{t('AfterMaxInactivityTimeHasBeenReached')}</p>
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

                <div className='col-0 col-xl-2'></div>

                <div className='col-6 col-xl-5'>
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

export default connect((state: State) => ({ws: state.ws}))(withRouter(Connecting));
