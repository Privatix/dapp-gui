import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import Countdown from 'react-countdown-now';

import ActiveConnection from '../connections/active';
import FinishServiceButton from '../connections/finishServiceButton';
import IncreaseDepositButton from '../connections/increaseDepositButton';

import ConfirmPopupSwal from 'components/confirmPopupSwal';
import notice from 'utils/notice';
import { State } from 'typings/state';

const countdownRender = ({ minutes, seconds }) => {
    return <span>{minutes}:{seconds}</span>;
};

const completeRemaining = translate('client/dashboard/connecting')(({t}) => {
    return <span>{t('WaitingTimeIsOver')}</span>;
});

@translate(['client/dashboard/connecting', 'utils/notice', 'confirmPopupSwal'])
class Connecting extends React.Component<any, any>{

    subscription: String;
    handler = 0;

    constructor(props:any) {
        super(props);
        this.state = {
            status: 'waiting',
            channel: null,
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

        if(this.handler !== 0){
            clearTimeout(this.state.handler);
        }

        if(this.subscription){
            ws.unsubscribe(this.subscription);
        }
    }

    refresh = async () => {

        const { t, ws } = this.props;

        const channels = await ws.getNotTerminatedClientChannels();

        if(this.subscription){
            await ws.unsubscribe(this.subscription);
        }

        if(channels.length){

            const ids = channels.map(channel => channel.id);
            this.subscription = await ws.subscribe('channel', ids, this.refresh);
            const channel = channels[0];
            switch(channel.channelStatus.serviceStatus){
                case 'active':
                    const offering = await ws.getOffering(channel.offering);
                    this.setState({status: 'active', channel, offering, pendingTimeCounter: 0});
                    break;
                case 'suspended':
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
                        this.setState({status: 'paused', channel, pendingTimeCounter: 0});
                    }else{
                        this.setState({status: 'suspended', channel, countryAlert, pendingTimeCounter: 0});
                    }
                    break;
                case 'pending':
                case 'activating':
                case 'suspending':
                case 'terminating':
                    this.setState({status: 'pending', channel, pendingTimeCounter: 0});
                    break;
                default:
                    let pendingTimeCounter = this.state.pendingTimeCounter + 1;

                    if (pendingTimeCounter >= 100) {
                        clearTimeout(this.state.handler);
                        notice({level: 'error', title: t('utils/notice:Attention!'), msg: t('FailedToAcceptOffering')}, 5000);
                        this.props.history.push('/client-dashboard-start');
                        return;
                    }

                    this.setState({status: 'pending', channel, pendingTimeCounter});
            }
        }else{

            this.handler = setTimeout(this.refresh.bind(this), 3000);
            this.setState({status: 'waiting', channel: null});

        }

    }

    waiting(){

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
        </div>;
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
            <ActiveConnection channels={[this.state.channel]}/>
        </div>;
    }

    suspended(){
        const { t, ws } = this.props;

        const countryAlert = this.state.countryAlert === '' ? '' :
            <div className='alert alert-warning clientCountryAlert'>{this.state.countryAlert}</div>;

        const done = () => {
            ws.changeChannelStatus(this.state.channel.id, 'resume');
        };

        return <div className='container-fluid'>
            <div className='row m-t-20'>
                <div className='col-6 col-xl-5 clientConnectionBl'>
                    <div className='card m-b-20 card-body buttonBlock'>
                        <p className='card-text m-t-5'><strong>{t('YouCanStartUsingVPN')}</strong></p>
                        {countryAlert}
                        <ConfirmPopupSwal
                            done={done}
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
                    <FinishServiceButton channel={this.state.channel} />
                </div>

            </div>

            <ActiveConnection channels={[this.state.channel]}/>
        </div>;
    }

    active(){

        const { t, ws } = this.props;

        const done = () => {
            ws.changeChannelStatus(this.state.channel.id, 'pause');
        };

        return <div className='container-fluid'>
            <div className='row m-t-20 clientConnectionBl'>
                <div className='col-4 col-xl-4 buttonBlock'>
                    <IncreaseDepositButton channel={this.state.channel} />
                </div>
                <div className='col-4 col-xl-4 buttonBlock'>
                    <div className='card m-b-20 card-body buttonBlock'>
                        <p className='card-text'>{t('ThisOperationWillPauseVPNUsage')}</p>
                        <p className='card-text'>{t('ForThisContractMaxSuspendTimeIs', {minutes: Math.ceil(this.state.offering.maxSuspendTime / 60)})}</p>
                        <ConfirmPopupSwal
                            done={done}
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
                    <FinishServiceButton channel={this.state.channel} />
                </div>
            </div>

            <ActiveConnection channels={[this.state.channel]}/>
        </div>;
    }

    paused(){

        const { t, ws } = this.props;

        const done = () => {
            ws.changeChannelStatus(this.state.channel.id, 'resume');
        };

        return <div className='container-fluid'>
            <div className='row m-t-20 clientConnectionBl'>
                <div className='col-6 col-xl-5'>
                    <div className='card m-b-20 card-body'>
                        <p className='card-text remainingText'>{t('Remaining')}:&nbsp;
                            <strong>
                                <Countdown date={Date.parse(this.state.channel.channelStatus.lastChanged) + this.state.channel.channelStatus.maxInactiveTime*1000}
                                           renderer={countdownRender}
                                           onComplete={completeRemaining}
                                />
                            </strong> {t('min')}
                        </p>
                        <p className='card-text text-muted'>{t('AfterMaxInactivityTimeHasBeenReached')}</p>
                        <ConfirmPopupSwal
                            done={done}
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
                    <FinishServiceButton channel={this.state.channel} />
                </div>
            </div>

            <ActiveConnection channels={[this.state.channel]}/>
        </div>;
    }

    render(){
        return this[this.state.status]();
    }
}

export default connect((state: State) => ({ws: state.ws}))(withRouter(Connecting));
