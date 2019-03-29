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

    connectHandler(evt: any) {
        evt.preventDefault();
        this.props.ws.changeChannelStatus(this.state.channel.id, 'resume');
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
                    this.setState({status: channel.channelStatus.serviceStatus, channel, pendingTimeCounter: 0});
                    break;
                default:
                    let pendingTimeCounter = this.state.pendingTimeCounter + 1;

                    if (pendingTimeCounter >= 100) {
                        clearTimeout(this.state.handler);
                        notice({level: 'error', header: t('utils/notice:Attention!'), msg: t('FailedToAcceptOffering')}, 5000);
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

        const countryAlert = this.state.countryAlert === '' ? '' :
            <div className='alert alert-warning clientCountryAlert'>{this.state.countryAlert}</div>;

        return <div className='container-fluid'>
            <div className='row m-t-20'>
                <div className='col-6 col-xl-5 clientConnectionBl'>
                    <div className='card m-b-20 card-body buttonBlock'>
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
                    <FinishServiceButton channel={this.state.channel} />
                </div>

            </div>

            <ActiveConnection channels={[this.state.channel]}/>
        </div>;
    }

    active(){

        const { t, ws, serviceName } = this.props;

        const done = () => {
            ws.changeChannelStatus(this.state.channel.id, 'pause');
        };

        const maxSuspendTimeMinutes = Math.ceil(this.state.offering.maxSuspendTime / 60);

        return <div className='container-fluid'>
            <div className='row m-t-20 clientConnectionBl'>
                <div className='col-4 col-xl-4 buttonBlock'>
                    <IncreaseDepositButton channel={this.state.channel} />
                </div>
                <div className='col-4 col-xl-4 buttonBlock'>
                    <div className='card m-b-20 card-body buttonBlock'>
                        <p className='card-text'>
                            <Trans i18nKey='ThisOperationWillPauseServiceUsage' values={{serviceName}} >
                                This operation will pause { {serviceName} } usage.
                            </Trans>
                        </p>
                        <p className='card-text'>{t('ForThisContractMaxSuspendTimeIs', {minutes: maxSuspendTimeMinutes})}</p>
                        <ConfirmPopupSwal
                            done={done}
                            title={t('Pause')}
                            text={<span>
                                      <Trans i18nKey='ThisOperationWillPauseServiceUsage' values={{serviceName}} >
                                          This operation will pause { {serviceName} } usage.
                                      </Trans><br />
                                      {t('ForThisContractMaxSuspendTimeIs', {minutes: maxSuspendTimeMinutes})}
                                  </span>}
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
        const deadlineStamp = Date.parse(channelStatus.lastChanged) + channelStatus.maxInactiveTime*1000 + (new Date()).getTimezoneOffset()*60*1000;

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
