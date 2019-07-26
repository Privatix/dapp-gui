import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { default as handlers, asyncProviders } from 'redux/actions';

import Noticer from 'common/noticer';

import SwitchAdvancedModeButton from './switchAdvancedModeButton';
import States from './states';

import notice from 'utils/notice';

import countryByISO from 'utils/countryByIso';

import { State } from 'typings/state';
import { Account } from 'typings/accounts';
import { Offering, ClientOfferingItem } from 'typings/offerings';

import { ClientChannel, ClientChannelUsage } from 'typings/channels';
import ExternalLink from 'common/etc/externalLink';
import ExitNotice from 'client/exitNotice';

import './lightweightMode.css';
import ModalWindow from 'common/modalWindow';
import NetworkAndVersion from 'common/networkAndVersion';
import GetPrix from 'common/wizard/getPrix';
import eth from 'utils/eth';
import prix from 'utils/prix';

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
    channel: ClientChannel;
    transferring: boolean;
    ip: string;
}

interface SelectItem {
    value: string;
    label: string;
}

interface IState {
    status: Status;
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
    private firstJobSubscription = null;

    private offerings: ClientOfferingItem[] = [];
    private blackList: Offering[] = [];

    constructor(props: IProps){
        super(props);
        this.state = {
            status: 'disconnected'
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

        const { dispatch, ws } = this.props;

        this.mounted = true;
        this.refresh();

        dispatch(handlers.setAutoTransfer(true));
        dispatch(asyncProviders.updateAccounts());

        ws.setGUISettings({mode: 'simple'});
    }

    componentWillUnmount(){

        const { dispatch } = this.props;

        this.mounted = false;
        this.unsubscribe();

        dispatch(handlers.setAutoTransfer(false));
    }

    componentDidUpdate(prevProps: IProps) {
        if(this.props.channel) {
            if(!prevProps.channel || prevProps.channel.channelStatus.serviceStatus !== this.props.channel.channelStatus.serviceStatus){
                this.refresh();
            }
        }
    }

    static getDerivedStateFromProps(props: IProps, state: IState){
        const { channel } = props;

        if(!channel){
            return {channel: null, status: state.status === 'connected' ? 'disconnected' : state.status};
        }

        let status = state.status;
        switch(channel.channelStatus.serviceStatus){
            case 'active':
                status = 'connected';
                break;
            case 'pending':
            case 'activating':
                status = 'connecting';
                break;
            case 'suspending':
            case 'suspended':
                switch(state.status){
                    case 'connecting':
                    case 'resuming':
                    case 'disconnecting':
                        break;
                    default:
                        status = 'suspended';
                }
                break;
            case 'terminating':
                status = 'disconnecting';
                break;
        }
        return {status};
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

    private checker = (event: any) => {

        switch(event.job.Status){
            case 'failed':
            case 'canceled':
                this.failedJob(null);
                break;
            case 'done':
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

        const { ws, channel } = this.props;

        this.updateOfferings();

        if(channel){

            if(!this.subscription){
                this.subscription = await ws.subscribe('channels', [channel.id], this.eventDispatcher.bind(this, channel.id));
            }

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
                    this.getSessionsDuration(channel.id);
                    this.checkCountryAccordance(channel);
                    break;
                case 'suspending':
                case 'suspended':
                    switch(this.state.status){
                        case 'connecting':
                            this.setState({status: 'resuming'});
                            ws.changeChannelStatus(channel.id, 'resume');
                            break;
                        case 'connected':
                            this.reconnect();
                            break;
                    }
                    break;
            }
        }else{
            if(this.subscription){
                ws.unsubscribe(this.subscription);
                this.subscription = null;
            }
            switch(this.state.status){
                case 'connecting':
                    if(!this.firstJobSubscription){
                        this.firstJobSubscription = await ws.subscribe('channel', ['clientPreChannelCreate'], this.checker, this.refresh);
                    }
                    break;
                default:
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

        if(offeringItem){
            this.addToBlackList(offeringItem.offering);
        }
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

        this.addOffering({offering: event.object, rating: 0});
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
        if(!item || !item.offering){
            return false;
        }
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

    private updateOfferings = async (evt?: any) => {

        if(!this.mounted){
            return;
        }

        const { ws } = this.props;

        const allOfferings = await ws.getClientOfferings('', 0, 0, [], [], 0, 0);
        const clientOfferings = allOfferings.items.filter(this.isProperOffering);
        const ids = clientOfferings.map(item => item.offering.id);

        const oldIds = this.offerings.map(item => item.offering.id);
        if(!oldIds.length || oldIds.some(id => !ids.includes(id)) || ids.some(id => !oldIds.includes(id))){
            if(this.offeringsSubscription){
                ws.unsubscribe(this.offeringsSubscription);
                this.offeringsSubscription = null;
            }

            this.offeringsSubscription = await ws.subscribe('offering', ids, this.updateOfferings, this.updateOfferings);
        }else{
            if(evt){
                console.log('offering event', evt);
            }
        }

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

        const { ws, channel } = this.props;

        this.setState({status: 'disconnected'});
        ws.changeChannelStatus(channel.id, 'terminate');
        this.unsubscribe();
        this.refresh();
    }

    private onResume = () => {

        const { ws, channel } = this.props;
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
        console.log('RANGE SELECTED!!!', range);
        const items = offeringsItems.map(offeringItem => ({id: offeringItem.offering.id, rating: offeringItem.rating}));
        const max = Math.max(...items.map(item => item.rating));

        if(max === 0){
            console.log('RATING NOT CALCULATED!!! result:', offeringsItems);
            return offeringsItems;
        }

        const k = 1/max;
        const normalizedItems = items.map(item => ({id: item.id, rating: item.rating*k}));

        const res = normalizedItems.filter(item => item.rating >= range.min && item.rating <= range.max);
        const ids = res.map(item => item.id);
        const offerings = offeringsItems.filter(offeringItem => ids.includes(offeringItem.offering.id));

        if(offerings.length > 0){
            console.log('RESULT: ', offerings);
            return offerings;
        }
        console.log('there are no offerings in selected range, next attempt');
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
            const res = offerings[Math.floor(Math.random()*offerings.length)];
            console.log('random offering:', res);
            return res;
        }

        const item = this.selectByProbability(items, Math.random()*k);
        const offering = offerings.find(offeringItem => offeringItem.offering.id === item.id);
        console.log('selected offering: ', offering);
        return offering;
    }

    private onChangeLocation = (selectedLocation: SelectItem) => {

        if(selectedLocation){
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

            const { channel, ip } = this.props;
            const { usage, selectedLocation, offeringItem, sessionsDuration } = this.state;
            const props = {usage, ip, channel, selectedLocation, offering: offeringItem ? offeringItem.offering : null, onChangeLocation: this.onChangeLocation, onDisconnect: this.onDisconnect, sessionsDuration};
            return <States.Connected {...props} />;

        },

        connecting: () => {

            const { channel } = this.props;
            const { selectedLocation, offeringItem } = this.state;
            const props = { channel, selectedLocation, offering: offeringItem ? offeringItem.offering : null, onChangeLocation: this.onChangeLocation };
            return <States.Connecting {...props} />;

        },

        resuming: () => this.states.connecting(),

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

            const { channel } = this.props;
            const { selectedLocation } = this.state;
            const props = { channel, selectedLocation };
            return <States.Disconnecting {...props} />;

        }
    };

    render(){

        const { t, account, transferring } = this.props;
        const { status } = this.state;

        return (
            <>
                <Noticer />
                <ExitNotice />
                <NetworkAndVersion className='networkANdBuildVersionSimple' />
                <style dangerouslySetInnerHTML={{__html: `
                   html { background: white; } body { background: white; }
                `}} />
                <div className='SMHelpBl'>
                    <ExternalLink
                        href={'https://help.privatix.network/core-software/simple-mode'}
                    ><i className='md md-help'></i> <span>{t('Help')}</span></ExternalLink>
                </div>
                <div className='widget-chart text-center'>

                    <div className='SMBalanceBl'>
                        <div className='SMBalance'>
                            <div className='SMBalanceRow'>
                                <div className='text'>{t('Account')} :</div>
                                <div className='value'>{account ? prix(account.ptcBalance) : 0} PRIX | {account ? eth(account.ethBalance) : 0} ETH</div>
                            </div>
                            <div className='SMBalanceRow'>
                                <div className='text'>{t('Marketplace')} :</div>
                                <div className='value'>{transferring ? <span className='lds-dual-ring-small'></span> : null } {account ? prix(account.pscBalance) : 0} PRIX</div>
                            </div>
                            <div className='SMBalanceRow'>
                                <div className='text'>{t('EscrowLocked')} : </div>
                                <div className='value'>{account ? prix(account.escrow) : 0} PRIX</div>
                            </div>
                        </div>

                        <ModalWindow wrapClass='addFundsPlusBtnBl'
                                     customClass='addFundsPlusBtn'
                                     modalTitle={t('addFundsModalTitle')}
                                     text={''}
                                     component={<GetPrix entryPoint={'/app'} accountId={account.id} isModal={true} />}
                        />
                    </div>

                    <div>
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
                                     component={<GetPrix entryPoint={'/app'} accountId={account.id} isModal={true} />}
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
       ,channel: state.channel
       ,ip: state.ip
       ,balance: account ? prix(account.pscBalance) : ''
       ,offeringsAvailability: state.offeringsAvailability
       ,transferring: state.transferring
    };
})(LightWeightClient);
