import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { default as handlers, asyncProviders } from 'redux/actions';

import CopyToClipboard from 'common/copyToClipboard';
import Noticer from 'common/noticer';

import SwitchAdvancedModeButton from './switchAdvancedModeButton';
import States from './states';

import notice from 'utils/notice';
import prix from 'utils/prix';

import countryByISO from 'utils/countryByIso';

import { State } from 'typings/state';
import { Account } from 'typings/accounts';
import { Offering, ClientOfferingItem } from 'typings/offerings';

import { ClientChannel, ClientChannelUsage } from 'typings/channels';
import ExternalLink from 'common/etc/externalLink';

import './lightweightMode.css';
import ModalWindow from 'common/modalWindow';
import GetPrix from 'common/wizard/getPrix';

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
    reconnectTry: number;
}

@translate(['client/simpleMode', 'client/dashboard/connecting', 'utils/notice', 'client/acceptOffering'])
class LightWeightClient extends React.Component<IProps, IState> {

    private mounted: boolean;
    private subscription: string;
    private offeringsSubscription = null;
    private newOfferingSubscription = null;
    private getIpSubscription = null;
    private firstJobSubscription = null;

    private offerings: ClientOfferingItem[] = [];
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
           ,reconnectTry: 0
        };
    }

    componentDidMount() {

        const { dispatch } = this.props;

        this.mounted = true;
        this.refresh();

        dispatch(handlers.setAutoTransfer(true));
        dispatch(asyncProviders.updateAccounts());
    }

    componentWillUnmount(){

        const { dispatch } = this.props;

        this.mounted = false;
        this.unsubscribe();

        dispatch(handlers.setAutoTransfer(false));
    }

    private unsubscribe(){

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

    private notify(msg: string){
        const notification = new Notification('Privatix', {
          body: msg
        });
        notification.onclick = () => {
          //
        };
    }

    private async getIp(attempt?: number){
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

    private checker = (event: any) => {

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

    private eventDispatcher(channelId: string, event: any){
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

        const { ws, t } = this.props;

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
                    if(!['connected', 'disconnected'].includes(this.state.status)){
                        this.notify(t('connectedMsg'));
                    }
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
                        case 'connected':
                            this.reconnect();
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

                        this.notify(t('disconnectedMsg'));

                        if(this.state.usage && this.state.usage.current === 0){
                            await ws.changeChannelStatus(this.state.channel.id, 'close');
                        }
                    }
                    this.setState({status: 'disconnected', channel: null, usage: null});
                    break;
            }
        }
    }

    private async hasSessions(channelId: string){

        const { ws } = this.props;

        const sessions = await ws.getSessions(channelId);
        return sessions.length > 0;

    }

    private async getSessionsDuration(channelId: string){

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

    private addToBlackList(offering: Offering){
        if(offering){
            this.blackList.push(offering);
        }
    }

    private async failedJob(channel: ClientChannel){

        if(!this.mounted){
            return;
        }

        const { t } = this.props;

        const msg = <>{t('AgentFailed')}<br/>{t('HisRating')}<br/>{t('PleaseTryAgain')}</>;

        notice({level: 'error', header: t('utils/notice:Attention!'), msg});
        await this.uncooperativeClose(channel);

    }

    private async checkCountryAccordance(channel: ClientChannel){

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

    private async uncooperativeClose(channel: ClientChannel){

        const { ws } = this.props;
        const { offeringItem, selectedLocation } = this.state;

        this.addToBlackList(offeringItem.offering);
        this.updateOfferings();
        this.setState({offeringItem: null});
        this.onChangeLocation(selectedLocation);
        if(channel){
            await ws.changeChannelStatus(channel.id, 'terminate');
            await ws.changeChannelStatus(channel.id, 'close');
        }
    }

    private onNewOffering = (event: any) => {

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


    private isNewCountry(offeringItem: ClientOfferingItem, locations: SelectItem[]){

        if(!this.isProperOffering(offeringItem)){
            return false;
        }

        const offering = offeringItem.offering;
        const country = offering.country.toLowerCase().trim();

        if(country === 'zz'){
            return false;
        }

        return locations.findIndex(location => location.value === country) === -1;
    }

    private isProperOffering = (item: ClientOfferingItem) => {
        return (this.blackList.findIndex(wreckOffering => wreckOffering.id === item.offering.id) === -1)
            && (item.offering.currentSupply > 0)
            && (!item.offering.maxUnit); // only unlimited offerings
    }

    private addOffering(offeringItem: ClientOfferingItem){

        if(!this.isProperOffering(offeringItem)){
            return;
        }

        const { locations } = this.state;

        this.offerings.push(offeringItem);
        const offering = offeringItem.offering;

        if(this.isNewCountry(offeringItem, locations)){
            const country = offering.country.toLowerCase().trim();
            this.setState({locations: locations.concat({value: country, label: countryByISO(country)})});
        }
    }

    private updateOfferings = async () => {

        if(!this.mounted){
            return;
        }

        const { ws } = this.props;

        const allOfferings = await ws.getClientOfferings('', 0, 0, [], 0, 0);
        const clientOfferings = allOfferings.items.filter(this.isProperOffering);
        const ids = clientOfferings.map(item => item.offering.id);

        if(this.offeringsSubscription){
            ws.unsubscribe(this.offeringsSubscription);
        }

        this.offeringsSubscription = await ws.subscribe('offering', ids, this.updateOfferings, this.updateOfferings);
        if(!this.newOfferingSubscription){
            this.newOfferingSubscription = await ws.subscribe('offering', ['clientAfterOfferingMsgBCPublish'], this.onNewOffering, this.updateOfferings);
        }
        this.offerings = clientOfferings;

        if(!this.state.locations){
            const locations = this.getLocations(this.offerings);
            this.setState({locations});
        }
    }

    private async updateCurrentCountry(channel: any){

        const { ws } = this.props;

        if(!this.state.selectedLocation || !this.state.offeringItem){
            const offering = await ws.getOffering(channel.offering);
            const country = offering.country.toLowerCase();
            this.setState({selectedLocation: {value: country, label: countryByISO(country)}, offeringItem: {offering, rating: 0}}); // TODO restore rating
        }
    }

    private async connect(offering: Offering){

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

    private reconnect = async () => {

        const { ws, t, localSettings } = this.props;
        const { channel, reconnectTry } = this.state;

        if(reconnectTry === 0){
            this.notify(t('disconnectedMsg'));
            notice({level: 'warning', header: t('utils/notice:Attention!'), msg: t('reconnectMsg')});
        }

        if(!channel){
            return;
        }

        const updatedChannelInfo = await ws.getObject('channel', channel.id);
        const usage = await ws.getChannelsUsage([channel.id]);

        if(usage[channel.id].cost >= updatedChannelInfo.totalDeposit){
            return;
        }

        if(updatedChannelInfo.channelStatus !== 'active'){
            this.setState({status: 'disconnected', channel: null, usage: null});
        }else{
            if(reconnectTry <= localSettings.reconnect.count){
                this.setState({reconnectTry: reconnectTry + 1});
                const connected = await this.tryToConnect();
                if(!connected){
                    setTimeout(this.reconnect, localSettings.reconnect.delay*Math.pow(localSettings.reconnect.progression, reconnectTry));
                }else{
                    this.setState({status: 'connected', reconnectTry: 0});
                }
            }else{
                notice({level: 'error', header: t('utils/notice:Attention!'), msg: t('reconnectFailed')});
            }
        }
    }

    private tryToConnect(){
        return new Promise(async (resolve: Function, reject: Function) => {
            const { ws } = this.props;
            const { channel } = this.state;

            let subscription;
            const eventDispatcher = (event: any) => {
                const unsubscribe = () => ws.unsubscribe(subscription);

                if('job' in event){
                    switch(event.job.Status){
                        case 'failed':
                        case 'canceled':
                            unsubscribe();
                            resolve(false);
                            break;
                        case 'done':
                            unsubscribe();
                            resolve(true);
                            break;
                    }
                }
            };
            ws.changeChannelStatus(channel.id, 'resume');
            subscription = await ws.subscribe('channels', [channel.id], eventDispatcher);
        });
    }

    private getOfferingsIdsForCountry(country: string){
        return this.offerings.filter(offeringItem => offeringItem.offering.country.toLowerCase() === country)
                             .map(offeringItem => offeringItem.offering.id);
    }

    private isAvailableOffering(offeringsAvailability: State['offeringsAvailability'], offeringItem: ClientOfferingItem){
        return offeringsAvailability.statuses[offeringItem.offering.id];
    }

    private onConnect = (evt: any) => {

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

    private getRange(offeringsItems: ClientOfferingItem[]){

        const table = [
            {min: 0, max: 0.1, probability: 0.15},
            {min: 0.1, max: 1, probability: 0.85}
        ];

        if(offeringsItems.length === 0){
            return undefined;
        }

        const probability = Math.random();
        const range = this.selectByProbability(table, probability);
        const items = offeringsItems.map(offeringItem => ({id: offeringItem.offering.id, rating: offeringItem.rating}));
        const max = Math.max(...items.map(item => item.rating));

        if(max === 0){
            return offeringsItems;
        }

        const k = 1/max;
        const normalizedItems = items.map(item => ({id: item.id, rating: item.rating*k}));

        const res = normalizedItems.filter(item => item.rating >= range.min && item.rating <= range.max);
        const ids = res.map(item => item.id);
        const offerings = offeringsItems.filter(offeringItem => ids.includes(offeringItem.offering.id));

        if(offerings.length > 0){
            return offerings;
        }

        return this.getRange(offeringsItems);
    }

    private selectByProbability(items: any[], probability: number){

        const result = items.reduce((res: any, item: any) => {
            if(res.item){
                return res;
            }
            if(res.probability <= item.probability){
                res.item = item;
                return res;
            }
            res.probability -= item.probability;
            return res;
        }, {probability, item: null});

        return result.item;
    }

    private flipCoin(offeringsItems: ClientOfferingItem[]){

        const offerings = this.getRange(offeringsItems);
        const items = offerings.map(offeringItem => ({id: offeringItem.offering.id, probability: offeringItem.rating/offeringItem.offering.unitPrice}));
        const k = items.reduce(((k:number, item: any) => k += item.probability), 0);

        if(k === 0){
            return offerings[Math.floor(Math.random()*offerings.length)];
        }

        const item = this.selectByProbability(items, Math.random()*k);
        const offering = offerings.find(offeringItem => offeringItem.offering.id === item.id);
        return offering;
    }

    private onChangeLocation = (selectedLocation: SelectItem) => {

        this.setState({selectedLocation, status: 'pingLocations'});

        const { dispatch } = this.props;

        const selectedCountry = selectedLocation.value;
        const ids = this.getOfferingsIdsForCountry(selectedCountry);
        const offeringsItems = this.offerings.filter(offeringItem => ids.includes(offeringItem.offering.id));

        dispatch(asyncProviders.setOfferingsAvailability(ids, () => {

            const { offeringsAvailability } = this.props;
            const { status } = this.state;

            if(this.mounted && status === 'pingLocations'){
                const offeringItem = this.flipCoin(offeringsItems);
                if(this.isAvailableOffering(offeringsAvailability, offeringItem)){
                    this.setState({status: 'disconnected', offeringItem});
                }else{
                    if(offeringsAvailability.counter === 0){
                        this.setState({status: 'pingFailed'});
                    }
                }
            }
        }));
    }

    private getLocations(offerings: ClientOfferingItem[]): SelectItem[] {

        const countries = offerings.reduce((registry: {[key: string]: boolean}, offeringItem: ClientOfferingItem) => {
            const offering = offeringItem.offering;
            const countries = offering.country.split(',').map(country => country.trim().toLowerCase());
            countries.forEach(country => {
                if(country !== 'zz' && ! (country in registry)){
                    registry[country] = true;
                }
            });
            return registry;
        }, {}) as {[key: string]: boolean};


        let countriesArr = Object.keys(countries).map(country => ({value: country, label: countryByISO(country)}));
        countriesArr.sort((a, b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));

        return countriesArr;
    }

    states: {[key in Status]: any} = {

        connected: () => {

            const { usage, ip, channel, selectedLocation, offeringItem, sessionsDuration } = this.state;
            const props = {usage, ip, channel, selectedLocation, offering: offeringItem ? offeringItem.offering : null, onChangeLocation: this.onChangeLocation, onDisconnect: this.onDisconnect, sessionsDuration};
            return <States.Connected {...props} />;

        },

        connecting: () => {

            const { channel, selectedLocation, offeringItem } = this.state;
            const props = { channel, selectedLocation, offering: offeringItem ? offeringItem.offering : null, onChangeLocation: this.onChangeLocation };
            return <States.Connecting {...props} />;

        },

        suspended: () => {

            const { selectedLocation, offeringItem } = this.state;
            const props = { selectedLocation, offering: offeringItem ? offeringItem.offering : null, onResume: this.onResume };
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
            const props = { locations, selectedLocation, offering: offeringItem ? offeringItem.offering : null, onChangeLocation: this.onChangeLocation, onConnect: this.onConnect };
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
                <Noticer />
                <style dangerouslySetInnerHTML={{__html: `
                   html { background: white; } body { background: white; }
                `}} />
                <div className='SMHelpBl'>
                    <ExternalLink
                        href={'https://help.privatix.network/core-software/simple-mode'}
                    ><i className='md md-help'></i> <span>{t('Help')}</span></ExternalLink>
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

                    <div className='simpleModeFooterText'>
                        <p>{t('footerTextLine0')}</p>
                        <p>{t('footerTextLine1')}</p>
                    </div>
                    <div className='simpleModeFooterMenu'>
                        <SwitchAdvancedModeButton /> |&nbsp;
                        <ModalWindow wrapClass='d-inline'
                                     customClass=''
                                     modalTitle={t('addFundsModalTitle')}
                                     text={t('addFunds')}
                                     component={<GetPrix mode={'simple'} entryPoint={'/app'} accountId={account.id} isModal={true} />}
                        /> |&nbsp;
                        <ExternalLink
                            href={'https://help.privatix.network/core-software/withdrawal-funds'}
                        ><span>{t('withdrawal')}</span></ExternalLink> |&nbsp;
                        <ExternalLink
                            href={'https://help.privatix.network/core-software/terms-of-use'}
                        ><span>{t('termsOfUse')}</span></ExternalLink>
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
       ,balance: account ? prix(account.pscBalance) : ''
       ,offeringsAvailability: state.offeringsAvailability
    };
})(LightWeightClient);
