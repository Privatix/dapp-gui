import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { asyncProviders } from 'redux/actions';

import JobName from 'common/badges/jobName';
import CopyToClipboard from 'common/copyToClipboard';
import DotProgress from 'common/etc/dotProgress';

import SwitchAdvancedModeButton from './switchAdvancedModeButton';
import SelectCountry from './selectCountry';

import toFixed from 'utils/toFixedN';
import notice from 'utils/notice';
import countryByISO from 'utils/countryByIso';

import { State } from 'typings/state';
import { Account } from 'typings/accounts';
import { Offering } from 'typings/offerings';
import { ClientChannel, ClientChannelUsage } from 'typings/channels';

interface IProps {
    ws: State['ws'];
    localSettings: State['localSettings'];
    offeringsAvailability: State['offeringsAvailability'];
    t?: any;
    gasPrice: number;
    account: Account;
    balance: string;
    dispatch?: any;
}

interface SelectItem {
    value: string;
    label: string;
    cost: string;
    offering?: Offering;
}

interface IState {
    status: string;
    ip: string;
    ping: string;
    selectedLocation: SelectItem;
    locations: SelectItem[];
    channel: ClientChannel;
    usage: ClientChannelUsage;
}

@translate(['client/simpleMode', 'client/dashboard/connecting', 'utils/notice', 'client/acceptOffering'])
class LightWeightClient extends React.Component<IProps, IState> {

    subscription: string;
    usageSubscription = null;
    offeringsSubscription = null;
    getIpSubscription = null;

    offerings: Offering[];

    constructor(props: IProps){
        super(props);
        this.state = {
            status: 'disconnected'
           ,ip: ''
           ,ping: ''
           ,selectedLocation: null
           ,locations: null
           ,channel: null
           ,usage: null
        };
    }

    componentDidMount() {
        this.refresh();
    }

    componentWillUnmount(){

        const { ws } = this.props;

        if(this.subscription){
            ws.unsubscribe(this.subscription);
        }
        if(this.usageSubscription){
            clearTimeout(this.usageSubscription);
        }
        if(this.offeringsSubscription){
            ws.unsubscribe(this.offeringsSubscription);
        }
        if(this.getIpSubscription){
            clearTimeout(this.getIpSubscription);
        }
    }

    async getIp(attempt?: number){
        const counter = !attempt ? 0 : attempt;
        if(counter < 5){
            try{
                const res = await fetch('https://api.ipify.org?format=json');
                const json = await res.json();
                this.setState({ip: json.ip});
            }catch(e){
                this.getIpSubscription = setTimeout(this.getIp.bind(this, counter+1), 3000);
            }
        }
    }

    private refresh = async () => {

        const { ws } = this.props;

        const channels = await ws.getNotTerminatedClientChannels();

        if(this.subscription){
            await ws.unsubscribe(this.subscription);
        }

        this.updateOfferings();
        if(channels.length){

            const ids = channels.map(channel => channel.id);
            this.subscription = await ws.subscribe('channel', ids, this.refresh);
            const channel = channels[0];
            this.setState({channel});
            this.updateCurrentCountry(channel);
            switch(channel.channelStatus.serviceStatus){
                case 'active':
                    this.setState({status: 'connected'});
                    this.subscribeUsage();
                    if(!this.state.ip || this.state.ip === ''){
                        this.getIp();
                    }
                    break;
                case 'pending':
                case 'activating':
                    this.setState({status: 'connecting'});
                    break;
                case 'suspending':
                case 'suspended':
                    if(this.state.status === 'connecting'){
                        if(channel.channelStatus.serviceStatus === 'suspended'){
                            ws.changeChannelStatus(channel.id, 'resume');
                        }
                    }else{
                        this.setState({status: 'suspended'});
                    }
                    break;
                case 'terminating':
                    this.setState({status: 'disconnecting'});
                    break;
            }
        }else{
            if(this.state.status !== 'connecting'){
                if(this.state.channel){
                    if(this.state.usage && this.state.usage.current === 0){
                        await ws.changeChannelStatus(this.state.channel.id, 'close');
                    }
                }
                this.setState({status: 'disconnected', channel: null});
                this.updateOfferings();
            }else{
                setTimeout(this.refresh, 1000);
            }

        }
    }

    async updateOfferings(){

        const { ws } = this.props;

        const clientOfferings = await ws.getClientOfferings('', 0, 0, [], 0, 0);
        const ids = clientOfferings.items.map(offering => offering.id);

        if(this.offeringsSubscription){
            ws.unsubscribe(this.offeringsSubscription);
        }

        this.offeringsSubscription = await ws.subscribe('offering', ['clientAfterOfferingMsgBCPublish', ...ids], this.refresh, this.refresh);
        this.offerings = clientOfferings.items.filter(offering => offering.currentSupply !== 0);

        if(!this.state.selectedLocation){
            const locations = this.getLocations(this.offerings);
            const selectedLocation = this.getOptimalLocation(locations);
            selectedLocation.offering = this.getOfferingForLocation(selectedLocation);
            this.setState({locations, selectedLocation});
        }
    }

    async updateCurrentCountry(channel: any){

        const { ws } = this.props;

        if(!this.state.selectedLocation){
            const offering = await ws.getOffering(channel.offering);
            const country = offering.country.toLowerCase();
            this.setState({selectedLocation: {value: country, label: countryByISO(country), cost: '', offering}});
        }
    }

    subscribeUsage = async () => {

        const { ws } = this.props;
        const { channel } = this.state;

        const usage = await ws.getChannelsUsage([channel.id]);

        this.setState({usage: usage[channel.id]});
        this.usageSubscription = setTimeout(this.subscribeUsage, 3000);
    }

    async connect(){

        const { t, ws, localSettings, gasPrice, account } = this.props;
        const { selectedLocation: { offering } } = this.state;

        const deposit = offering.unitPrice * offering.minUnits;
        const customDeposit = deposit;

        let err = false;
        let msg = '';

        if(account.pscBalance < customDeposit){
            err=true;
            msg += ' ' + t('client/acceptOffering:NotEnoughPrixForDeposit');
        }

        if(account.ethBalance < localSettings.gas.acceptOffering*gasPrice){
            err=true;
            msg += ' ' + t('client/acceptOffering:NotEnoughToPublishTransaction');
        }

        if(err){
            notice({level: 'error', header: t('utils/notice:Attention!'), msg});
            this.setState({status: 'disconnected'});
            return;
        }

        try {
            const channelId = await ws.acceptOffering(account.ethAddr, offering.id, customDeposit, gasPrice);
            if (typeof channelId === 'string') {
                notice({level: 'info', header: t('utils/notice:Congratulations!'), msg: t('client/acceptOffering:OfferingAccepted')});
                this.refresh();
            }
        } catch (e) {
            this.setState({status: 'disconnected'});
            msg = t('client/acceptOffering:ErrorAcceptingOffering');
            notice({level: 'error', header: t('utils/notice:Attention!'), msg});
        }
    }

    onConnect = (evt: any) => {

        evt.preventDefault();

        this.setState({status: 'connecting', ping: 'inProgress'});

        const { dispatch } = this.props;
        const { selectedLocation } = this.state;

        const ids = this.offerings.filter(offering => offering.country.toLowerCase() === selectedLocation.value).map(offering => offering.id);
        dispatch(asyncProviders.setOfferingsAvailability(ids, () => {

            const { offeringsAvailability } = this.props;
            const { selectedLocation: { offering }, ping } = this.state;

            const ids = Object.keys(offeringsAvailability.statuses);
            if(ping === 'inProgress' && ids.includes(offering.id)){
                if(offeringsAvailability.statuses[offering.id]){
                    this.setState({ping: ''});
                    this.connect();
                }else{
                    this.setState({status: 'disconnected', ping: 'failed'});
                }
            }
        }));
    }

    private onDisconnect = () => {

        const { ws } = this.props;
        const { channel } = this.state;

        ws.changeChannelStatus(channel.id, 'terminate');
        this.setState({status: 'disconnecting', ip: ''});
    }

    private onResume = () => {

        const { ws } = this.props;
        const { channel } = this.state;
        ws.changeChannelStatus(channel.id, 'resume');
        this.setState({status: 'connecting'});
    }

    private onChangeLocation = (selectedLocation: SelectItem) => {
        this.setState({selectedLocation, ping: ''});
    }

    private getOptimalLocation(locations: any[]){
        return locations[Math.floor(Math.random()*locations.length)];
    }

    private getLocations(offerings: Offering[]): SelectItem[] {

        let countries = offerings.reduce((registry: any, offering: any) => {
            const countries = offering.country.split(',').map(country => country.trim().toLowerCase());
            countries.forEach(country => {
                if(! (country in registry)){
                    registry[country] = [];
                }
                registry[country].push(offering);
            });
            return registry;
        }, {});

        Object.keys(countries).forEach(country => {
            countries[country] = this.getOptimalLocation(countries[country]);
        });

        return Object.keys(countries).map(country => {
            const offering = countries[country];
            const price = toFixed({number: offering.unitPrice/1e8, fixed: 8});
            const unitName = offering.unitName;
            return {value: country, label: countryByISO(country), cost: `${price} / ${unitName}`, offering};
        });
    }

    getOfferingForLocation(location: SelectItem){
        const offerings = this.offerings.filter(offering => offering.country.toLowerCase() === location.value);
        return offerings[Math.floor(Math.random()*offerings.length)];
    }

    connected(){

        const { t } = this.props;
        const { usage, ip, channel, selectedLocation } = this.state;

        const secondsTotal = Math.floor((Date.now() - (new Date().getTimezoneOffset()*60*1000)- Date.parse(channel.job.createdAt))/1000);
        const seconds = secondsTotal%60;
        const minutes = ((secondsTotal - seconds)/60)%60;
        const hours = (secondsTotal - minutes*60 - seconds)/(60*60);

        return (
            <>
                <h6 className='text-muted'>IP: {ip}</h6>
                <br/>
                <div className='content clearfix content-center'>
                    <SelectCountry onSelect={this.onChangeLocation}
                                   selectedLocation={selectedLocation}
                                   disabled={true}
                    />
                </div>
                <br/>
                <br/>
                <button type='button' onClick={this.onDisconnect} className='btn btn-primary btn-custom btn-rounded waves-effect waves-light'>
                    {t('Disconnect')}
                </button>


                <ul className='list-inline m-t-15'>
                    <li>
                        <h6 className='text-muted m-t-20'>{t('TIME')}</h6>
                        <h2 className='m-t-20'>{hours}:{minutes}:{seconds}</h2>
                        <h4 className='text-muted  m-b-0'>hh:mm:ss</h4>
                    </li>
                    <li>
                        <h6 className='text-muted m-t-20'>{t('TRAFFIC')}</h6>
                        <h2 className='m-t-20'>{usage ? usage.current : null}</h2>
                        <h4 className='text-muted m-b-0'>MB</h4>
                    </li>
                    <li>
                        <h6 className='text-muted m-t-20'>{t('SPENT')}</h6>
                        <h2 className='m-t-20'>{usage ? toFixed({number: usage.cost/1e8, fixed: 4}) : null}</h2>
                        <h4 className='text-muted m-b-0'>PRIX</h4>
                    </li>
                </ul>
            </>
        );
    }

    connecting(){

        const { t } = this.props;
        const { channel, selectedLocation, ping } = this.state;

        const steps = ['clientPreChannelCreate'
                      ,'clientAfterChannelCreate'
                      ,'clientEndpointRestore'
                      ,'clientPreServiceUnsuspend'
                      ,'completeServiceTransition'
        ];
        const currentStep = function(step: string){
            const i = steps.indexOf(step);
            return i !== -1 ? i + 1 : 0;
        };

        const step = channel ? currentStep(channel.job.jobtype) : 0;
        const percentage = Math.floor(step * 100/steps.length);

        return (
            <>
                <div className='content clearfix content-center'>
                    <SelectCountry onSelect={this.onChangeLocation}
                                   selectedLocation={selectedLocation}
                                   disabled={true}
                    />
                </div>
                <br />
                {ping === 'inProgress'
                    ? <div>
                        <div style={ {margin: '10px'} }>{t('SearchingTheOptimalNode')} <DotProgress /></div>
                        <div style={ {margin: '10px'} }>
                            <i className='fa fa-circle-o-notch fa-spin' style={ {fontSize: '28px'} }></i>
                        </div>
                    </div>
                    :
                    <>
                        <button type='button' disabled className='btn btn-primary btn-custom btn-rounded waves-effect waves-light'>
                            {t('Connecting')} <DotProgress />
                        </button>
                        <br />
                        <br />
                        <progress
                            style={ {margin: 'auto', width: '300px', height: '10px'} }
                            className='wow animated progress-animated'
                            value={percentage}
                            max={100}
                        />
                        <br />
                        {channel ? <JobName className='text-muted' jobtype={channel.job.jobtype} /> : null }
                    </>
                }
            </>
        );
    }

    suspended(){

        const { t } = this.props;
        const { selectedLocation } = this.state;

        return (
            <>
                <div className='content clearfix content-center'>
                    <SelectCountry onSelect={this.onChangeLocation}
                                   selectedLocation={selectedLocation}
                                   disabled={true}
                    />
                </div>
                <br/>
                <br/>
                <button type='button' onClick={this.onResume} className='btn btn-primary btn-custom btn-rounded waves-effect waves-light'>
                    {t('Resume')}
                </button>
            </>
        );
    }

    disconnected(){

        const { t } = this.props;
        const { locations, selectedLocation, ping } = this.state;

        if(!locations || !locations.length){
            return (
                <div className='text-center m-t-15 m-b-15'>
                    <div className='lds-dual-ring'></div>
                </div>
            );
        }

        return (
            <>
                <div className='content clearfix content-center'>
                    <SelectCountry onSelect={this.onChangeLocation}
                                   selectedLocation={selectedLocation}
                                   locations={locations}
                    />
                </div>
                <br/>
                <br/>
                <button type='button' onClick={this.onConnect} className='btn btn-primary btn-custom btn-rounded waves-effect waves-light'>
                    {t('Connect')}
                </button>
                { ping === 'failed'
                    ? <div style={ {margin: '10px'} }>{t('NoAvailableOfferings')}</div>
                    : null
                }
            </>
        );
    }

    disconnecting(){

        const { t } = this.props;
        const { channel, selectedLocation } = this.state;

        const steps = ['completeServiceTransition'
                      ,'clientPreServiceTerminate'
        ];

        const currentStep = function(step: string){
            const i = steps.indexOf(step);
            return i !== -1 ? i + 1 : 0;
        };

        const step = channel ? currentStep(channel.job.jobtype) : 0;
        const percentage = Math.floor(step * 100/steps.length);

        return (
            <>
                <div className='content clearfix content-center'>
                    <SelectCountry onSelect={this.onChangeLocation}
                                   selectedLocation={selectedLocation}
                                   disabled={true}
                    />
                </div>
                <br />
                <button type='button' disabled className='btn btn-primary btn-custom btn-rounded waves-effect waves-light'>
                    {t('Disconnecting')} <DotProgress />
                </button>
                <br />
                <br />
                <progress
                    style={ {margin: 'auto', width: '300px', height: '10px'} }
                    className='wow animated progress-animated'
                    value={percentage}
                    max={100}
                />
                <br />
                <JobName className='text-muted' jobtype={channel.job.jobtype} />
            </>
        );
    }

    render(){

        const { t, balance, account } = this.props;
        const { status } = this.state;

        const ethAddr = account ? `0x${account.ethAddr}` : '';

        return (
            <div style={ {background: '#ffffff', height: '100vh'} }>
                <div style={ {textAlign: 'right'} }>
                    <SwitchAdvancedModeButton />
                </div>
                <div className='widget-chart text-center'>
                    <div id='sparkline3'>
                        <h5 style={ {margin: 'auto', width: '300px'} }>
                            <span className='shortTableText' style={ {marginRight: '10px'} } >{t('Address')}: </span>
                            <span className='shortTableText' title={ethAddr}>{ethAddr}</span>
                            <CopyToClipboard text={ethAddr} />
                        </h5>
                        <h5>{t('Balance')}: { balance } PRIX</h5>
                        <img src='images/Privatix_logo.png' alt='image' className='img-fluid' width='250' />
                        <h1>{t(status)}</h1>
                        <br/>
                        { this[this.state.status]() }
                    </div>
                </div>
            </div>
        );
    }
}

export default connect((state: State) => {
    const account = state.accounts.find((account: Account) => account.isDefault);
    return {
        ws: state.ws
       ,localSettings: state.localSettings
       ,gasPrice: parseFloat(state.settings['eth.default.gasprice'])
       ,account
       ,balance: account ? toFixed({number: account.pscBalance/1e8, fixed: 2}) : ''
       ,offeringsAvailability: state.offeringsAvailability
    };
})(LightWeightClient);
