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
import { Offering, ClientOfferingItem } from 'typings/offerings';

import { ClientChannel, ClientChannelUsage } from 'typings/channels';

type Status = 'disconnected'
            | 'disconnecting'
            | 'connected'
            | 'connecting'
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
    offeringItem: ClientOfferingItem;
    sessionsDuration: number;
    topUpInProgress: boolean;
}

@translate(['client/simpleMode', 'client/dashboard/connecting', 'utils/notice', 'client/acceptOffering'])
class LightWeightClient extends React.Component<IProps, IState> {

    mounted: boolean;
    subscription: string;
    offeringsSubscription = null;
    newOfferingSubscription = null;
    getIpSubscription = null;
    firstJobSubscription = null;
    increaseSubscription = null;

    private offerings: ClientOfferingItem[] = [];
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
           ,offeringItem: {offering: null, rating: 0}
           ,sessionsDuration: 0
           ,topUpInProgress: false
        };
    }

    componentDidMount() {
        this.mounted = true;
        this.refresh();
    }

    componentWillUnmount(){

        const { ws } = this.props;

        this.mounted = false;
        this.unsubscribe();
        if(this.increaseSubscription){
            ws.unsubscribe(this.increaseSubscription);
            this.increaseSubscription = null;
        }
    }

    unsubscribe(){
        const { ws } = this.props;

        if(this.subscription){
            ws.unsubscribe(this.subscription);
            this.subscription = null;
        }
        if(this.offeringsSubscription){
            ws.unsubscribe(this.offeringsSubscription);
            this.offeringsSubscription = null;
        }
        if(this.newOfferingSubscription){
            ws.unsubscribe(this.newOfferingSubscription);
            this.newOfferingSubscription = null;
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
        if(!this.mounted){
            return;
        }
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
            case 'canceled':
                unsubscribe();
                this.failedJob(null);
                break;
            case 'done':
                unsubscribe();
                this.refresh();
                break;
        }
    }

    eventDispatcher(channelId: string, event: any){
        if('job' in event){
            this.refresh();
        }else if(channelId in event){
            const usage = event[channelId];
            this.setState({usage});
        }
    }

    private refresh = async () => {

        if(!this.mounted){
            return;
        }

        const { ws } = this.props;

        const channels = await ws.getNotTerminatedClientChannels();

        if(this.subscription){
            await ws.unsubscribe(this.subscription);
            this.subscription = null;
        }

        this.updateOfferings();
        if(channels.length){

            const channel = channels[0];

            this.subscription = await ws.subscribe('channels', [channel.id], this.eventDispatcher.bind(this, channel.id));

            if(['canceled', 'failed'].indexOf(channel.job.status) !== -1){
                this.failedJob(channel);
                return;
            }

            if(channel.job.jobtype === 'completeServiceTransition'
               && channel.job.status === 'done'
               && channel.channelStatus.serviceStatus === 'suspended'
               && !(await this.hasSessions(channel.id))){
                this.failedJob(channel);
                return;
            }

            this.setState({channel});
            this.updateCurrentCountry(channel);
            switch(channel.channelStatus.serviceStatus){
                case 'active':
                    this.setState({status: 'connected'});
                    if(!this.state.ip || this.state.ip === ''){
                        this.getIp();
                    }
                    this.getSessionsDuration(channel.id);
                    this.checkCountryAccordance(channel);
                    break;
                case 'pending':
                case 'activating':
                    this.setState({status: 'connecting'});
                    break;
                case 'suspending':
                case 'suspended':
                    switch(this.state.status){
                        case 'connecting':
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
                default:
                    if(this.state.channel){
                        if(this.state.usage && this.state.usage.current === 0){
                            await ws.changeChannelStatus(this.state.channel.id, 'close');
                        }
                    }
                    this.setState({status: 'disconnected', channel: null, usage: null});
                    break;
            }
        }
    }

    async hasSessions(channelId: string){

        const { ws } = this.props;

        const sessions = await ws.getSessions(channelId);
        return sessions.length > 0;

    }
    async getSessionsDuration(channelId: string){

        const { ws } = this.props;

        const sessions = await ws.getSessions(channelId);
        const sessionsDuration = sessions.reduce((res, session) => {
            if(session.started === null){
                return res;
            }
            if(session.stopped === null){
                return res + Date.now() - Date.parse(session.started);
            }
            return res + Date.parse(session.stopped) - Date.parse(session.started);
        }, 0);
        this.setState({sessionsDuration});
    }

    addToBlackList(offering: Offering){
        if(offering){
            this.blackList.push(offering);
        }
    }

    async failedJob(channel: ClientChannel){

        if(!this.mounted){
            return;
        }

        const { t } = this.props;

        const msg = <>{t('AgentFailed')}<br/>{t('HisRating')}<br/>{t('PleaseTryAgain')}</>;

        notice({level: 'error', header: t('utils/notice:Attention!'), msg});
        await this.uncooperativeClose(channel);

    }

    async checkCountryAccordance(channel: ClientChannel){

        if(!this.mounted){
            return;
        }

        const { t, ws } = this.props;

        const endpoint = await ws.getEndpoints(channel.id);
        if (endpoint[0]) {
            const countryStatus = endpoint[0].countryStatus;
            if (['invalid', 'unknown'].includes(countryStatus)) {
                notice({level: 'error', header: t('utils/notice:Attention!'), msg: t('CountryAlertInvalid')});
                await this.uncooperativeClose(channel);
            }
        }
    }

    async uncooperativeClose(channel: ClientChannel){

        const { ws } = this.props;
        const { offeringItem, selectedLocation } = this.state;

        this.addToBlackList(offeringItem.offering);
        this.updateOfferings();
        this.setState({offeringItem: null});
        this.onChangeLocation(selectedLocation ? selectedLocation : this.optimalLocation);
        if(channel){
            await ws.changeChannelStatus(channel.id, 'terminate');
            await ws.changeChannelStatus(channel.id, 'close');
        }
    }

    onNewOffering = (event: any) => {

        if(!this.mounted){
            return;
        }

        if(event.job.Status !== 'done'){
            return;
        }

        if(event.object.currentSupply <= 0){
            return;
        }

        this.addOffering(event.object);
    }


    isNewCountry(offering: Offering, locations: SelectItem[]){
        const country = offering.country.toLowerCase().trim();
        if(country === 'zz'){
            return false;
        }
        return locations.findIndex(location => location.value === country) === -1;
    }

    addOffering(offeringItem: ClientOfferingItem){

        const { locations } = this.state;

        this.offerings.push(offeringItem);
        const offering = offeringItem.offering;

        if(this.isNewCountry(offering, locations)){
            const country = offering.country.toLowerCase().trim();
            this.setState({locations: locations.concat({value: country, label: countryByISO(country)})});
        }
    }

    updateOfferings = async () => {

        if(!this.mounted){
            return;
        }

        const { ws } = this.props;

        const allOfferings = await ws.getClientOfferings('', 0, 0, [], 0, 0);
        const clientOfferings = allOfferings.items.filter(item => this.blackList.findIndex(wreckOffering => wreckOffering.id === item.offering.id) === -1);
        const ids = clientOfferings.map(item => item.offering.id);

        if(this.offeringsSubscription){
            ws.unsubscribe(this.offeringsSubscription);
        }

        this.offeringsSubscription = await ws.subscribe('offering', ids, this.updateOfferings, this.updateOfferings);
        if(!this.newOfferingSubscription){
            this.newOfferingSubscription = await ws.subscribe('offering', ['clientAfterOfferingMsgBCPublish'], this.onNewOffering, this.updateOfferings);
        }
        this.offerings = clientOfferings.filter(item => item.offering.currentSupply > 0);

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

        if(!this.state.selectedLocation || !this.state.offeringItem){
            const offering = await ws.getOffering(channel.offering);
            const country = offering.country.toLowerCase();
            this.setState({selectedLocation: {value: country, label: countryByISO(country)}, offeringItem: {offering, rating: 0}}); // TODO restore rating
        }
    }

    async refreshUsage(channelId: string, usage: ClientChannelUsage){

        if(!this.mounted){
            return;
        }

        this.setState({usage: usage[channelId]});
    }

    async connect(offering: Offering){

        const { t, ws, localSettings, gasPrice, account } = this.props;

        const deposit = offering.unitPrice * offering.minUnits;

        let err = false;
        let msg = '';

        if(account.pscBalance < deposit){
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
            const channelId = await ws.acceptOffering(account.ethAddr, offering.id, deposit, gasPrice);
            if (typeof channelId === 'string') {
                notice({level: 'info', header: t('utils/notice:Congratulations!'), msg: t('client/acceptOffering:OfferingAccepted')});
                this.refresh();
            }
        } catch (e) {
            if(this.mounted){
                this.setState({status: 'disconnected'});
            }
            msg = t('client/acceptOffering:ErrorAcceptingOffering');
            notice({level: 'error', header: t('utils/notice:Attention!'), msg});
        }
    }

    getOfferingsIdsForCountry(country: string){

        return this.offerings.filter(offeringItem => offeringItem.offering.country.toLowerCase() === country).map(offeringItem => offeringItem.offering.id);
    }

    getAvailableOffering(offeringsAvailability: State['offeringsAvailability'], country: string){
        const ids = this.getOfferingsIdsForCountry(country);
        const offerings = ids.filter(offeringId => offeringsAvailability.statuses[offeringId])
                             .map(offeringId => this.offerings.find(offeringItem => offeringItem.offering.id === offeringId));
        return offerings && offerings.length ? offerings[0] : null;
    }

    onConnect = (evt: any) => {

        evt.preventDefault();

        const { offeringItem } = this.state;

        this.setState({status: 'connecting'});
        this.connect(offeringItem.offering);

    }

    private onDisconnect = () => {

        const { ws } = this.props;
        const { channel } = this.state;

        ws.changeChannelStatus(channel.id, 'terminate');
        this.unsubscribe();
        this.refresh();
        this.setState({ip: '', status: 'disconnecting'});
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

    selectOptimalLocation = async () => {

        if(!this.mounted){
            return;
        }

        const selectedLocation = this.optimalLocation;
        this.setState({status: 'pingLocations', selectedLocation});
        const getCountries = () => {
            return this.shuffle(Object.keys(this.offerings.reduce((registry: any, offeringItem: ClientOfferingItem) => {
                registry[offeringItem.offering.country.trim().toLowerCase()] = 1;
                return registry;
            }, {})));
        };

        const countries = getCountries();

        for(let i=0; i<countries.length; i++){
            try{
                const country = countries[i];
                const offeringItem = await this.pingLocation(country);
                this.setState({status: 'disconnected', offeringItem});
                return;
            }catch(e){
                continue;
            }
        }

        setTimeout(this.selectOptimalLocation, 3000);

    }

    private pingLocation(country: string): Promise<ClientOfferingItem> {

        return new Promise((resolve, reject) => {
            const { dispatch } = this.props;

            const ids = this.getOfferingsIdsForCountry(country);

            dispatch(asyncProviders.setOfferingsAvailability(ids, () => {

                const { offeringsAvailability } = this.props;
                const { status } = this.state;

                if(this.mounted && status === 'pingLocations'){
                    const offeringItem = this.getAvailableOffering(offeringsAvailability, country);
                    if(offeringItem){
                        resolve(offeringItem);
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
                const offeringItem = this.getAvailableOffering(offeringsAvailability, selectedCountry);
                if(offeringItem){
                    this.setState({status: 'disconnected', offeringItem});
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

    private getLocations(offerings: ClientOfferingItem[]): SelectItem[] {

        let countries = offerings.reduce((registry: any, offeringItem: ClientOfferingItem) => {
            const offering = offeringItem.offering;
            const countries = offering.country.split(',').map(country => country.trim().toLowerCase());
            countries.forEach(country => {
                if(country !== 'zz' && ! (country in registry)){
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

            const { usage, ip, channel, selectedLocation, offeringItem, sessionsDuration } = this.state;
            const props = {usage, ip, channel, selectedLocation, offering: offeringItem.offering, onChangeLocation: this.onChangeLocation, onDisconnect: this.onDisconnect, sessionsDuration};
            return <States.Connected {...props} />;
            
        },

        connecting: () => {

            const { channel, selectedLocation, offeringItem } = this.state;
            const props = { channel, selectedLocation, offering: offeringItem.offering, onChangeLocation: this.onChangeLocation };
            return <States.Connecting {...props} />;
            
        },

        suspended: () => {

            const { selectedLocation, offeringItem } = this.state;
            const props = { selectedLocation, offering: offeringItem.offering, onResume: this.onResume };
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

            const { locations, selectedLocation, offeringItem } = this.state;
            const props = { locations, selectedLocation, offering: offeringItem.offering, onChangeLocation: this.onChangeLocation, onConnect: this.onConnect };
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
            <>
                <style dangerouslySetInnerHTML={{__html: `
                   html { background: white; } body { background: white; }
                `}} />
                <div style={ {textAlign: 'right'} }>
                    <SwitchAdvancedModeButton />
                </div>
                <div className='widget-chart text-center'>
                    <div>
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
            </>
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
