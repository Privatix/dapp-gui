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
}

interface IState {
    status: string;
    ip: string;
    selectedLocation: SelectItem;
    locations: SelectItem[];
    channel: ClientChannel;
    usage: ClientChannelUsage;
    offering: Offering;
}

@translate(['client/simpleMode', 'client/dashboard/connecting', 'utils/notice', 'client/acceptOffering'])
class LightWeightClient extends React.Component<IProps, IState> {

    mounted: boolean;
    subscription: string;
    usageSubscription = null;
    offeringsSubscription = null;
    getIpSubscription = null;
    refreshSubscription = null;

    offerings: Offering[];
    optimalLocation = {value: 'optimalLocation', label: 'Optimal location'};

    constructor(props: IProps){
        super(props);
        this.state = {
            status: 'disconnected'
           ,ip: ''
           ,selectedLocation: null
           ,locations: null
           ,channel: null
           ,usage: null
           ,offering: null
        };
    }

    componentDidMount() {
        this.mounted = true;
        this.refresh();
    }

    componentWillUnmount(){
        this.mounted = false;
        this.unsubscribe();

    }

    unsubscribe(){
        const { ws } = this.props;

        if(this.subscription){
            ws.unsubscribe(this.subscription);
            this.subscription = null;
        }
        if(this.usageSubscription){
            clearTimeout(this.usageSubscription);
            this.usageSubscription = null;
        }
        if(this.offeringsSubscription){
            ws.unsubscribe(this.offeringsSubscription);
            this.offeringsSubscription = null;
        }
        if(this.getIpSubscription){
            clearTimeout(this.getIpSubscription);
            this.getIpSubscription = null;
        }
        if(this.refreshSubscription){
            clearTimeout(this.refreshSubscription);
            this.refreshSubscription = null;
        }
    }

    async getIp(attempt?: number){
        const counter = !attempt ? 0 : attempt;
        if(counter < 5){
            try{
                const res = await fetch('https://api.ipify.org?format=json');
                const json = await res.json();
                if(this.mounted){
                    this.setState({ip: json.ip});
                }
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
                    this.subscribeUsage(channel);
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
                    switch(this.state.status){
                        case 'connecting':
                            this.setState({status: 'resuming'});
                            ws.changeChannelStatus(channel.id, 'resume');
                            break;
                        case 'disconnecting':
                            break;
                        default:
                            this.setState({status: 'suspended'});
                    }
                    break;
                case 'terminating':
                    this.setState({status: 'disconnecting'});
                    break;
            }
        }else{
            switch(this.state.status){
                case 'connecting':
                    this.refreshSubscription = setTimeout(this.refresh, 2000);
                    break;
                case 'disconnecting':
                    if(this.state.channel){
                        if(this.state.usage && this.state.usage.current === 0){
                            await ws.changeChannelStatus(this.state.channel.id, 'close');
                        }
                    }
                    this.setState({status: 'disconnected', channel: null});
                    break;
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

        if(!this.state.locations){
            const locations = this.getLocations(this.offerings);
            this.setState({locations});
            if(!this.state.selectedLocation){
                this.selectOptimalLocation();
            }
        }
    }

    async updateCurrentCountry(channel: any){

        const { ws } = this.props;

        if(!this.state.selectedLocation){
            const offering = await ws.getOffering(channel.offering);
            const country = offering.country.toLowerCase();
            this.setState({selectedLocation: {value: country, label: countryByISO(country)}, offering});
        }
    }

    async refreshUsage(channel: ClientChannel){

        const { ws } = this.props;

        const usage = await ws.getChannelsUsage([channel.id]);

        this.setState({usage: usage[channel.id]});
        this.usageSubscription = setTimeout(this.refreshUsage.bind(this, channel), 3000);
    }

    subscribeUsage(channel: ClientChannel){
        if(!this.usageSubscription){
            this.refreshUsage(channel);
        }
    }

    async connect(offering: Offering){

        const { t, ws, localSettings, gasPrice, account } = this.props;

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

    getOfferingsIdsForCountry(country: string){

        return this.offerings.filter(offering => offering.country.toLowerCase() === country).map(offering => offering.id);
    }

    getAvailableOffering(offeringsAvailability: State['offeringsAvailability'], country: string){
        const ids = this.getOfferingsIdsForCountry(country);
        const offerings = ids.filter(offeringId => offeringsAvailability.statuses[offeringId])
                             .map(offeringId => this.offerings.find(offering => offering.id === offeringId));
        return offerings && offerings.length ? offerings[0] : null;
    }

    onConnect = (evt: any) => {

        evt.preventDefault();

        const { offering } = this.state;

        this.setState({status: 'connecting'});
        this.connect(offering);

    }

    private onDisconnect = () => {

        const { ws } = this.props;
        const { channel } = this.state;

        ws.changeChannelStatus(channel.id, 'terminate');
        this.unsubscribe();
        this.refresh();
        this.setState({ip: ''});
    }

    private onResume = () => {

        const { ws } = this.props;
        const { channel } = this.state;
        ws.changeChannelStatus(channel.id, 'resume');
        this.setState({status: 'connecting'});
    }

    makeLocation(country: string): SelectItem {
        return {value: country, label: countryByISO(country)};
    }

    shuffle(a: Array<any>): Array<any> {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    async selectOptimalLocation(){
        this.setState({status: 'pingLocations'});
        const countries = this.shuffle(Object.keys(this.offerings.reduce((registry: any, offering: Offering) => {
            registry[offering.country.trim().toLowerCase()] = 1;
            return registry;
        }, {})));

        for(let i=0; i<countries.length; i++){
            try{
                const country = countries[i];
                const offering = await this.pingLocation(country);
                const selectedLocation = this.optimalLocation;
                this.setState({status: 'disconnected', offering, selectedLocation});
                return;
            }catch(e){
                continue;
            }
        }
    }

    private pingLocation(country: string): Promise<Offering> {

        return new Promise((resolve, reject) => {
            const { dispatch } = this.props;

            const ids = this.getOfferingsIdsForCountry(country);

            dispatch(asyncProviders.setOfferingsAvailability(ids, () => {

                const { offeringsAvailability } = this.props;
                const { status } = this.state;

                if(this.mounted && status === 'pingLocations'){
                    const offering = this.getAvailableOffering(offeringsAvailability, country);
                    if(offering){
                        resolve(offering);
                    }else{
                        if(offeringsAvailability.counter === 0){
                            reject();
                        }
                    }
                }
            }));
        });
    }

    private onChangeLocation = (selectedLocation: SelectItem) => {

        this.setState({selectedLocation, status: 'pingLocations'});

        if(selectedLocation.value === this.optimalLocation.value){
            this.selectOptimalLocation();
            return;
        }


        const { dispatch } = this.props;

        const selectedCountry = selectedLocation.value;
        const ids = this.getOfferingsIdsForCountry(selectedCountry);

        dispatch(asyncProviders.setOfferingsAvailability(ids, () => {

            const { offeringsAvailability } = this.props;
            const { status } = this.state;

            if(this.mounted && status === 'pingLocations'){
                const offering = this.getAvailableOffering(offeringsAvailability, selectedCountry);
                if(offering){
                    this.setState({status: 'disconnected', offering});
                }else{
                    if(offeringsAvailability.counter === 0){
                        this.setState({status: 'pingFailed'});
                    }
                }
            }
        }));
    }

    private getOptimalLocation(locations: SelectItem[]){
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

        const res = Object.keys(countries).map(country => ({value: country, label: countryByISO(country)}));
        res.unshift(this.optimalLocation);
        return res;
    }

    connected(){

        const { t } = this.props;
        const { usage, ip, channel, selectedLocation, offering } = this.state;

        const secondsTotal = Math.floor((Date.now() - (new Date().getTimezoneOffset()*60*1000)- Date.parse(channel.job.createdAt))/1000);
        const seconds = secondsTotal%60;
        const minutes = ((secondsTotal - seconds)/60)%60;
        const hours = (secondsTotal - minutes*60 - seconds)/(60*60);

        return (
            <>
                <h6 className='text-muted spacing'>IP: {ip}</h6>
                <div className='content clearfix content-center spacing'>
                    <SelectCountry onSelect={this.onChangeLocation}
                                   selectedLocation={selectedLocation}
                                   disabled={true}
                                   offering={offering}
                    />
                </div>
                <button type='button' onClick={this.onDisconnect} className='btn btn-primary btn-custom btn-rounded waves-effect waves-light spacing'>
                    {t('Disconnect')}
                </button>
                <ul className='list-inline m-t-15 spacing'>
                    <li>
                        <h6 className='text-muted' style={ {marginTop: '0px'} }>{t('TIME')}</h6>
                        <h2 className='m-t-20'>{hours}:{minutes}:{seconds}</h2>
                        <h4 className='text-muted  m-b-0'>hh:mm:ss</h4>
                    </li>
                    <li>
                        <h6 className='text-muted' style={ {marginTop: '0px'} }>{t('TRAFFIC')}</h6>
                        <h2 className='m-t-20'>{usage ? usage.current : null}</h2>
                        <h4 className='text-muted m-b-0'>MB</h4>
                    </li>
                    <li>
                        <h6 className='text-muted' style={ {marginTop: '0px'} }>{t('SPENT')}</h6>
                        <h2 className='m-t-20'>{usage ? toFixed({number: usage.cost/1e8, fixed: 4}) : null}</h2>
                        <h4 className='text-muted m-b-0'>PRIX</h4>
                    </li>
                </ul>
            </>
        );
    }

    resuming(){
        return this.connecting();
    }

    connecting(){

        const { t } = this.props;
        const { channel, selectedLocation, offering } = this.state;

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
                <div className='content clearfix content-center spacing'>
                    <SelectCountry onSelect={this.onChangeLocation}
                                   selectedLocation={selectedLocation}
                                   offering={offering}
                                   disabled={true}
                    />
                </div>
                <button type='button' disabled className='btn btn-primary btn-custom btn-rounded waves-effect waves-light spacing'>
                    {t('Connecting')} <DotProgress />
                </button>
                <progress
                    style={ {marginLeft: 'auto', marginRight: 'auto', width: '300px', height: '10px', display: 'block'} }
                    className='wow animated progress-animated spacing'
                    value={percentage}
                    max={100}
                />
                {channel ? <JobName className='text-muted spacing' jobtype={channel.job.jobtype} /> : null }
            </>
        );
    }

    suspended(){

        const { t } = this.props;
        const { selectedLocation, offering } = this.state;

        return (
            <>
                <div className='content clearfix content-center spacing'>
                    <SelectCountry onSelect={this.onChangeLocation}
                                   selectedLocation={selectedLocation}
                                   offering={offering}
                                   disabled={true}
                    />
                </div>
                <button type='button' onClick={this.onResume} className='btn btn-primary btn-custom btn-rounded waves-effect waves-light spacing'>
                    {t('Resume')}
                </button>
            </>
        );
    }

    pingLocations(){

        const { t } = this.props;
        const { locations, selectedLocation } = this.state;

        if(!locations || !locations.length){
            return (
                <div className='text-center m-t-15 m-b-15 spacing'>
                    <div className='lds-dual-ring'></div>
                </div>
            );
        }

        return (
            <>
                <div className='content clearfix content-center spacing'>
                    <SelectCountry onSelect={this.onChangeLocation}
                                   selectedLocation={selectedLocation}
                                   locations={locations}
                    />
                </div>
                <button type='button' disabled className='btn btn-primary btn-custom btn-rounded waves-effect waves-light spacing'>
                    {t('Connect')}
                </button>
                <div className='spacing'>
                    <div style={ {margin: '10px'} }>{t('SearchingTheOptimalNode')} <DotProgress /></div>
                    <div style={ {margin: '10px'} }>
                        <i className='fa fa-circle-o-notch fa-spin' style={ {fontSize: '28px'} }></i>
                    </div>
                </div>
            </>
        );
    }

    pingFailed(){

        const { t } = this.props;
        const { locations } = this.state;

        return (
            <>
                <div className='content clearfix content-center spacing'>
                    <SelectCountry onSelect={this.onChangeLocation}
                                   selectedLocation={null}
                                   locations={locations}
                    />
                </div>
                <button type='button' disabled className='btn btn-primary btn-custom btn-rounded waves-effect waves-light spacing'>
                    {t('Connect')}
                </button>
                <div style={ {margin: '10px'} }>{t('NoAvailableOfferings')}</div>
            </>
        );
    }

    disconnected(){

        const { t } = this.props;
        const { locations, selectedLocation, offering } = this.state;

        if(!locations || !locations.length){
            return (
                <div className='text-center m-t-15 m-b-15 spacing'>
                    <div className='lds-dual-ring'></div>
                </div>
            );
        }

        return (
            <>
                <div className='content clearfix content-center spacing'>
                    <SelectCountry onSelect={this.onChangeLocation}
                                   selectedLocation={selectedLocation}
                                   locations={locations}
                                   offering={offering}
                    />
                </div>
                <button type='button' disabled={!offering} onClick={this.onConnect} className='btn btn-primary btn-custom btn-rounded waves-effect waves-light spacing'>
                    {t('Connect')}
                </button>
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
                <div className='content clearfix content-center spacing'>
                    <SelectCountry onSelect={this.onChangeLocation}
                                   selectedLocation={selectedLocation}
                                   disabled={true}
                    />
                </div>
                <button type='button' disabled className='btn btn-primary btn-custom btn-rounded waves-effect waves-light spacing'>
                    {t('Disconnecting')} <DotProgress />
                </button>
                <progress
                    style={ {marginLeft: 'auto', marginRight: 'auto', width: '300px', height: '10px', display: 'block'} }
                    className='wow animated progress-animated spacing'
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
                        <img src='images/Privatix_logo.png' alt='image' className='img-fluid spacing' width='250' />
                        <h1 className='spacing'>{t(status)}</h1>
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
