import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { asyncProviders } from 'redux/actions';

import CopyToClipboard from 'common/copyToClipboard';

import SwitchAdvancedModeButton from './switchAdvancedModeButton';
import States from './states';

import toFixed from 'utils/toFixedN';
import notice from 'utils/notice';
import countryByISO from 'utils/countryByIso';

import { State } from 'typings/state';
import { Account } from 'typings/accounts';
import { Offering } from 'typings/offerings';
import { ClientChannel, ClientChannelUsage } from 'typings/channels';

type Status = 'disconnected'
            | 'disconnecting'
            | 'connected'
            | 'connecting'
            | 'resuming'
            | 'pingLocations'
            | 'pingFailed'
            | 'suspended'
            ;

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
    status: Status;
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
    firstJobSubscription = null;

    private offerings: Offering[];
    private optimalLocation = {value: 'optimalLocation', label: 'Optimal location'};
    private blackList: Offering[] = [];

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
        if(this.firstJobSubscription){
            ws.unsubscribe(this.firstJobSubscription);
            this.firstJobSubscription = null;
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

    checker = (event: any) => {
        const unsubscribe = () => {
                const { ws } = this.props;
                ws.unsubscribe(this.firstJobSubscription);
                this.firstJobSubscription = null;
        };
        switch(event.job.Status){
            case 'failed':
                unsubscribe();
                this.failedJob();
                break;
            case 'done':
                unsubscribe();
                this.refresh();
                break;
        }
    }

    private refresh = async () => {

        const { ws } = this.props;

        const jobs = ['clientPreChannelCreate'
              ,'clientAfterChannelCreate'
              ,'clientEndpointRestore'
              ,'clientPreServiceUnsuspend'
              ,'completeServiceTransition'
        ];
        const channels = await ws.getNotTerminatedClientChannels();

        if(this.subscription){
            await ws.unsubscribe(this.subscription);
        }

        this.updateOfferings();
        if(channels.length){

            const ids = channels.map(channel => channel.id);
            this.subscription = await ws.subscribe('channel', [...ids, ...jobs], this.refresh, this.refresh);
            const channel = channels[0];

            if(channel.job.status === 'failed'){
                this.failedJob();
                return;
            }

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
                    if(!this.firstJobSubscription){
                        this.firstJobSubscription = await ws.subscribe('channel', ['clientPreChannelCreate'], this.checker, this.refresh);
                    }
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

    addToBlackList(offering: Offering){
        this.blackList.push(offering);
    }

    failedJob(){

        const { t } = this.props;
        const { offering, selectedLocation } = this.state;

        const msg = <>{t('AgentFailed')}<br/>{t('HisRating')}<br/>{t('PleaseTryAgain')}</>;

        notice({level: 'error', header: t('utils/notice:Attention!'), msg});

        this.addToBlackList(offering);
        this.updateOfferings();
        this.setState({offering: null});
        this.onChangeLocation(selectedLocation);
    }

    async updateOfferings(){

        const { ws } = this.props;

        const allOfferings = await ws.getClientOfferings('', 0, 0, [], 0, 0);
        const clientOfferings = allOfferings.items.filter(offering => this.blackList.findIndex(wreckOffering => wreckOffering.id === offering.id) === -1);
        const ids = clientOfferings.map(offering => offering.id);

        if(this.offeringsSubscription){
            ws.unsubscribe(this.offeringsSubscription);
        }

        this.offeringsSubscription = await ws.subscribe('offering', ['clientAfterOfferingMsgBCPublish', ...ids], this.refresh, this.refresh);
        this.offerings = clientOfferings.filter(offering => offering.currentSupply !== 0);

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

    states: {[key in Status]: any} = {

        connected: () => {

            const { usage, ip, channel, selectedLocation, offering } = this.state;
            const props = {usage, ip, channel, selectedLocation, offering, onChangeLocation: this.onChangeLocation, onDisconnect: this.onDisconnect};
            return <States.Connected {...props} />;
            
        },

        resuming: () => {
            return this.states.connecting();
        },

        connecting: () => {

            const { channel, selectedLocation, offering } = this.state;
            const props = { channel, selectedLocation, offering, onChangeLocation: this.onChangeLocation };
            return <States.Connecting {...props} />;
            
        },

        suspended: () => {

            const { selectedLocation, offering } = this.state;
            const props = { selectedLocation, offering, onResume: this.onResume };
            return <States.Suspended {...props} />;
            
        },

        pingLocations: () => {

            const { locations, selectedLocation } = this.state;
            const props = { locations, selectedLocation, onChangeLocation: this.onChangeLocation };
            return <States.PingLocations {...props} />;
            
        },

        pingFailed: () => {

            const { locations, selectedLocation  } = this.state;
            const props = { locations, selectedLocation, onChangeLocation: this.onChangeLocation };
            return <States.PingFailed {...props} />;

        },

        disconnected: () => {

            const { locations, selectedLocation, offering } = this.state;
            const props = { locations, selectedLocation, offering, onChangeLocation: this.onChangeLocation, onConnect: this.onConnect };
            return <States.Disconnected {...props} />;

        },

        disconnecting: () => {

            const { channel, selectedLocation } = this.state;
            const props = { channel, selectedLocation };
            return <States.Disconnecting {...props} />;
            
        }
    };

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
                        { this.states[this.state.status]() }
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
