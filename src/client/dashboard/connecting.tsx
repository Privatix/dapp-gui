import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withTranslation, Trans } from 'react-i18next';
import Countdown from 'react-countdown-now';

import { default as handlers, asyncProviders } from 'redux/actions';

import ActiveConnection from 'client/connections/active';
import FinishServiceButton from 'client/connections/finishServiceButton';
import IncreaseDepositButton from 'client/connections/increaseDepositButton';

import ConfirmPopupSwal from 'common/confirmPopupSwal';
import notice from 'utils/notice';

import { State } from 'typings/state';
import { ClientChannel } from 'typings/channels';

const countdownRender = ( { hours, minutes, seconds, completed } ) => {

    if(completed) {
        const View = withTranslation('client/dashboard/connecting')(({t}) => {
            return <p className='card-text text-muted'>{t('WaitingTimeIsOver')}</p>;
        });

        return <View />;
    } else {

        const View = withTranslation('client/dashboard/connecting')(({t}) => {
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

const translate = withTranslation(['client/dashboard/connecting', 'utils/notice', 'confirmPopupSwal', 'client/simpleMode']);

class Connecting extends React.Component<any, any>{

    mounted = false;
    resuming = false;

    constructor(props:any) {
        super(props);
        this.state = {
            status: 'waiting',
            pendingTimeCounter: 0,
            offering: null,
            countryAlert: '',
            usage: null
        };
    }

    componentDidMount() {
        const { ws, stoppingSupervisor, channel, dispatch } = this.props;
        this.mounted = true;

        if(!stoppingSupervisor){
            this.refresh();

            dispatch(handlers.setAutoTransfer(false));
            dispatch(asyncProviders.updateAccounts());
            ws.setGUISettings({mode: 'anvanced'});
            channel.addEventListener('StatusChanged', this.onStatusChanged);
            channel.addEventListener('UsageChanged', this.onUsageChanged);
            channel.setMode('advanced');

            this.onUsageChanged();
        }
    }

    componentWillUnmount() {

        const { channel } = this.props;

        this.mounted = false;
        channel.removeEventListener('StatusChanged', this.onStatusChanged);
        channel.removeEventListener('UsageChanged', this.onUsageChanged);
    }

    onStatusChanged = () => {

        const { channel } = this.props;
        const { offering } = this.state;
        if(channel && channel.model){
            this.setState({status: channel.model.channelStatus.serviceStatus, job: channel.getJob()});
            if(!offering){
                this.setOffering();
            }
        }
    }

    async setOffering(){

        const { ws, channel } = this.props;

        const offering = await ws.getOffering(channel.model.offering);
        if(!this.mounted){
            return;
        }
        this.setState({status: 'active', offering, pendingTimeCounter: 0});
    }

    onUsageChanged = () => {
        const { channel } = this.props;
        this.setState({usage: channel.getUsage()});
    }

    connectHandler = (evt: any) => {
        evt.preventDefault();
        const { channel } = this.props;

        if(!this.resuming){
            this.resuming = true;
            channel.resume();
        }
    }

    refresh = async () => {

        if(!this.mounted){
            return;
        }

        const { t, ws, channel } = this.props;
        const { usage, offering } = this.state;

        if(channel.model){

            switch(channel.model.channelStatus.serviceStatus){
                case 'active':
                    this.resuming = false;
                    if(!offering){
                        this.setOffering();
                    }
                    break;
                case 'suspended':
                    let countryAlert = '';
                    const endpoint = await ws.getEndpoints(channel.model.id);
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

                    if(usage && usage.current > 0){
                        this.setState({status: 'paused', pendingTimeCounter: 0});
                    }else{
                        this.setState({status: 'suspended', countryAlert, pendingTimeCounter: 0});
                    }
                    break;
                case 'pending':
                case 'activating':
                case 'suspending':
                case 'terminating':
                    this.setState({status: channel.model.channelStatus.serviceStatus, pendingTimeCounter: 0});
                    break;
                default:
                    let pendingTimeCounter = this.state.pendingTimeCounter + 1;

                    if (pendingTimeCounter >= 100) {
                        notice({level: 'error', header: t('utils/notice:Attention!'), msg: t('FailedToAcceptOffering')});
                        this.props.history.push('/client-dashboard-start');
                        return;
                    }

                    this.setState({status: 'pending', pendingTimeCounter});
            }
        }else{
            if(this.state.status !== 'waiting'){
                this.props.history.push('/client-dashboard-start');
            } else {
                this.setState({status: 'waiting'});
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
            <ActiveConnection />
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

        const { t, serviceName, channel } = this.props;
        const { usage } = this.state;

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

                        <button className='btn btn-primary btn-custom btn-block' onClick={this.connectHandler}>{t('Connect')}</button>
                    </div>
                </div>

                <div className='col-0 col-xl-2'></div>

                <div className='col-6 col-xl-5 clientConnectionBl'>
                    <FinishServiceButton channel={channel} usage={usage} />
                </div>

            </div>

            <ActiveConnection />
        </div>;
    }

    active(){

        const { t, serviceName, channel } = this.props;
        const { offering, usage } = this.state;

        const done = () => {
            channel.pause();
        };

        const maxSuspendTimeMinutes = offering ? Math.ceil(offering.maxSuspendTime / 60) : 0;

        const pauseMsg = <Trans i18nKey='client/dashboard/connecting:ThisOperationWillPauseServiceUsage' values={{serviceName}} >
                              This operation will pause { {serviceName} } usage.
                          </Trans>;

        return <div className='container-fluid'>
            <div className='row m-t-20 clientConnectionBl'>
                <div className='col-4 col-xl-4 buttonBlock'>
                    <IncreaseDepositButton channel={channel} />
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
                    <FinishServiceButton channel={channel} usage={usage} />
                </div>
            </div>

            <ActiveConnection />
        </div>;
    }

    paused(){

        const { t, channel } = this.props;
        const { usage } = this.state;

        const deadlineStamp = this.getDeadLine(channel.model.channelStatus);

        return <div className='container-fluid'>
            <div className='row m-t-20 clientConnectionBl'>
                <div className='col-6 col-xl-5'>
                    <div className='card m-b-20 card-body'>
                        <Countdown date={deadlineStamp}
                                   renderer={countdownRender}
                        />
                        <button className='btn btn-primary btn-custom btn-block' onClick={this.connectHandler}>{t('Resume')}</button>
                    </div>
                </div>

                <div className='col-0 col-xl-2'></div>

                <div className='col-6 col-xl-5'>
                    <FinishServiceButton channel={channel} usage={usage} />
                </div>
            </div>

            <ActiveConnection />
        </div>;
    }

    render(){
        return this[this.state.status]();
    }
}

export default connect((state: State) => ({
    ws: state.ws
   ,channel: state.channel
   ,serviceName: state.serviceName
   ,stoppingSupervisor: state.stoppingSupervisor
}))(withRouter(translate(Connecting)));
