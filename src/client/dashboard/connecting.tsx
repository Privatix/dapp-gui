import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { translate, Trans } from 'react-i18next';
import Countdown from 'react-countdown-now';

import ActiveConnection from 'client/connections/active';
import FinishServiceButton from 'client/connections/finishServiceButton';
import IncreaseDepositButton from 'client/connections/increaseDepositButton';

import ConfirmPopupSwal from 'common/confirmPopupSwal';
import notice from 'utils/notice';

import { State } from 'typings/state';
import { ClientChannel } from 'typings/channels';

const countdownRender = ( { hours, minutes, seconds, completed } ) => {

    if(completed) {
        const View = translate('client/dashboard/connecting')(({t}) => {
            return <p className='card-text text-muted'>{t('WaitingTimeIsOver')}</p>;
        });

        return <View />;
    } else {

        const View = translate('client/dashboard/connecting')(({t}) => {
            return (
                <React.Fragment>
                    <p className='card-text remainingText'>{t('Remaining')}:&nbsp;
                        <strong>
                            <span>{hours}:{minutes}:{seconds}</span>
                        </strong>
                    </p>
                    <p className='card-text text-muted'>{t('AfterMaxInactivityTimeHasBeenReached')}</p>
                </React.Fragment>
            );
        });

        return <View />;
    }

};

@translate(['client/dashboard/connecting', 'utils/notice', 'confirmPopupSwal', 'client/simpleMode'])
class Connecting extends React.Component<any, any>{

    subscription: String;
    handler = 0;
    mounted = false;
    resuming = false;

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
        this.mounted = true;
        this.refresh();
    }

    componentWillUnmount() {

        this.mounted = false;
        const { ws } = this.props;

        if(this.handler !== 0){
            clearTimeout(this.state.handler);
        }

        if(this.subscription){
            ws.unsubscribe(this.subscription);
        }
    }

    connectHandler(evt: any) {
        evt.preventDefault();
        if(!this.resuming){
            this.resuming = true;
            this.props.ws.changeChannelStatus(this.state.channel.id, 'resume');
        }
    }

    refresh = async () => {

        if(!this.mounted){
            return;
        }

        const { t, ws } = this.props;

        const channels = await ws.getNotTerminatedClientChannels();
        if(!this.mounted){
            return;
        }
        if(channels.length){

            if(this.subscription && (!this.state.channel || this.state.channel.id !== channels[0].id)){
                ws.unsubscribe(this.subscription);
                this.subscription = null;
            }
            if(!this.subscription){
                this.subscription = await ws.subscribe('channel', [channels[0].id], this.refresh);
            }

            const channel = channels[0];
            if(!this.mounted){
                return;
            }
            switch(channel.channelStatus.serviceStatus){
                case 'active':
                    this.resuming = false;
                    const offering = await ws.getOffering(channel.offering);
                    if(!this.mounted){
                        return;
                    }
                    this.setState({status: 'active', channel, offering, pendingTimeCounter: 0});
                    break;
                case 'suspended':
                    let countryAlert = '';
                    const endpoint = await ws.getEndpoints(channel.id);
                    if(!this.mounted){
                        return;
                    }
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
                    this.setState({status: channel.channelStatus.serviceStatus, channel, pendingTimeCounter: 0});
                    break;
                default:
                    let pendingTimeCounter = this.state.pendingTimeCounter + 1;

                    if (pendingTimeCounter >= 100) {
                        clearTimeout(this.state.handler);
                        notice({level: 'error', header: t('utils/notice:Attention!'), msg: t('FailedToAcceptOffering')});
                        this.props.history.push('/client-dashboard-start');
                        return;
                    }

                    this.setState({status: 'pending', channel, pendingTimeCounter});
            }
        }else{
            if(this.state.status !== 'waiting'){
                this.props.history.push('/client-dashboard-start');
            } else {
                this.handler = setTimeout(this.refresh.bind(this), 1000);
                this.setState({status: 'waiting', channel: null});
            }

        }

    }

    getDeadLine(channelStatus: ClientChannel['channelStatus']){
        return Date.parse(channelStatus.lastChanged) + channelStatus.maxInactiveTime*1000;
    }

    waiting(){

        const { t, serviceName } = this.props;

        return <div className='container-fluid'>
            <div className='row m-t-20'>
                <div className='col-5'>
                    <div className='card m-b-20 card-body'>
                        <p className='card-text'>
                            <Trans i18nKey='AfterTheConnectionIsReady' values={{serviceName}} >
                                After the connection is ready, you can start using the { {serviceName} }
                            </Trans>
                        </p>
                        <button className='btn btn-inverse btn-block btn-lg disabled'>
                            <span className='loadingIconBl'><i className='fa fa-spin fa-refresh'></i></span>{t('Synchronizing')}...
                        </button>
                    </div>
                </div>
            </div>
        </div>;
    }

    getTransitionView(status: string){

        const { t, serviceName } = this.props;

        const titles = {
            pending: 'TheServiceHasAPendingStatus',
            activating: 'TheServiceHasAnActivatingStatus',
            suspending: 'TheServiceHasASuspendingStatus',
            terminating: 'TheServiceHasATerminatingStatus'
        };


        return <div className='container-fluid'>
            <div className='row m-t-20'>
                <div className='col-5'>
                    <div className='card m-b-20 card-body'>
                        <p className='card-text'>
                            <Trans i18nKey={titles[status]} values={{serviceName, status}} >
                                the service { {serviceName} } has a {{status}} status
                            </Trans>
                        </p>
                        <button className='btn btn-inverse btn-block btn-lg disabled'>
                            <span className='loadingIconBl'><i className='fa fa-spin fa-refresh'></i></span>{t('Synchronizing')}...
                        </button>
                    </div>
                </div>
            </div>
            <ActiveConnection channels={[this.state.channel]}/>
        </div>;
    }

    pending(){
        return this.getTransitionView('pending');
    }

    activating(){
        return this.getTransitionView('activating');
    }

    suspending(){
        return this.getTransitionView('suspending');
    }

    terminating(){
        return this.getTransitionView('terminating');
    }

    suspended(){

        const { t, serviceName } = this.props;
        const { channel } = this.state;
        const deadlineStamp = this.getDeadLine(channel.channelStatus);

        const countryAlert = this.state.countryAlert === '' ? '' :
            <div className='alert alert-warning clientCountryAlert'>{this.state.countryAlert}</div>;

        return <div className='container-fluid'>
            <div className='row m-t-20'>
                <div className='col-6 col-xl-5 clientConnectionBl'>
                    <div className='card m-b-20 card-body buttonBlock'>
                        <Countdown date={deadlineStamp}
                                   renderer={countdownRender}
                        />
                        <p className='card-text m-t-5'><strong>
                            <Trans i18nKey='YouCanStartUsingService' values={{serviceName}} >
                                You can start using { {serviceName} }
                            </Trans>
                        </strong></p>
                        {countryAlert}

                        <button className='btn btn-primary btn-custom btn-block' onClick={this.connectHandler.bind(this)}>{t('Connect')}</button>
                    </div>
                </div>

                <div className='col-0 col-xl-2'></div>

                <div className='col-6 col-xl-5 clientConnectionBl'>
                    <FinishServiceButton channel={channel} />
                </div>

            </div>

            <ActiveConnection channels={[channel]}/>
        </div>;
    }

    active(){

        const { t, ws, serviceName } = this.props;

        const done = () => {
            ws.changeChannelStatus(this.state.channel.id, 'pause');
        };

        const maxSuspendTimeMinutes = Math.ceil(this.state.offering.maxSuspendTime / 60);

        const pauseMsg = <Trans i18nKey='client/dashboard/connecting:ThisOperationWillPauseServiceUsage' values={{serviceName}} >
                              This operation will pause { {serviceName} } usage.
                          </Trans>;

        return <div className='container-fluid'>
            <div className='row m-t-20 clientConnectionBl'>
                <div className='col-4 col-xl-4 buttonBlock'>
                    <IncreaseDepositButton channel={this.state.channel} />
                </div>
                <div className='col-4 col-xl-4 buttonBlock'>
                    <div className='card m-b-20 card-body buttonBlock'>
                        <p className='card-text'>
                            {pauseMsg}
                        </p>
                        <p className='card-text'>{t('ForThisContractMaxSuspendTimeIs', {minutes: maxSuspendTimeMinutes})}</p>
                        <ConfirmPopupSwal
                            done={done}
                            title={t('Pause')}
                            text={<>
                                      {pauseMsg}
                                      <br />
                                      {t('ForThisContractMaxSuspendTimeIs', {minutes: maxSuspendTimeMinutes})}
                                  </>}
                            className={'btn btn-primary btn-custom btn-block'}
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

        const { t } = this.props;

        const { channelStatus } = this.state.channel;
        const deadlineStamp = this.getDeadLine(channelStatus);

        return <div className='container-fluid'>
            <div className='row m-t-20 clientConnectionBl'>
                <div className='col-6 col-xl-5'>
                    <div className='card m-b-20 card-body'>
                        <Countdown date={deadlineStamp}
                                   renderer={countdownRender}
                        />
                        <button className='btn btn-primary btn-custom btn-block' onClick={this.connectHandler.bind(this)}>{t('Resume')}</button>
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

export default connect((state: State) => ({ws: state.ws, serviceName: state.serviceName}))(withRouter(Connecting));
