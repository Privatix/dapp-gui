import * as React from 'react';
import { connect } from 'react-redux';
import { WithTranslation, withTranslation } from 'react-i18next';

import { default as handlers, asyncProviders } from 'redux/actions';

import Noticer from 'common/noticer';

import SwitchAdvancedModeButton from './switchAdvancedModeButton';
import States from './states';

import { default as notice, notify } from 'utils/notice';

import countryByISO from 'utils/countryByIso';

import { State } from 'typings/state';
import { Account } from 'typings/accounts';
import { Offering, ClientOfferingItem } from 'typings/offerings';

import { ClientChannelUsage } from 'typings/channels';

import Channel from 'models/channel';
import Offerings from 'models/offerings';

import ExternalLink from 'common/etc/externalLink';
import ExternalLinkWarning from 'common/externalLinkWarning';
import ExitNotice from 'client/exit/notice';
import ExitScreen from 'client/exit/';

import './lightweightMode.css';
import ModalWindow from 'common/modalWindow';
import NetworkAndVersion from 'common/networkAndVersion';
import GetPrix from 'common/wizard/getPrix';
import eth from 'utils/eth';
import prix from 'utils/prix';
import * as log from 'electron-log';

import { Status} from 'models/channel';

interface IProps extends WithTranslation {
    ws: State['ws'];
    localSettings: State['localSettings'];
    offeringsAvailability: State['offeringsAvailability'];
    account: Account;
    balance: string;
    dispatch?: any;
    channel: Channel;
    offerings: Offerings;
    transferring: boolean;
    stoppingSupervisor: boolean;
}

interface SelectItem {
    value: string;
    label: string;
}

interface IState {
    status: Status;
    selectedLocation: SelectItem;
    locations: SelectItem[];
    channel: Channel;
    ip: string;
    usage: ClientChannelUsage;
    job: any;
    offeringItem: ClientOfferingItem;
    offerings: ClientOfferingItem[];
    sessionsDuration: number;
    reconnectTry: number;
}

const translate = withTranslation(['client/simpleMode', 'client/dashboard/connecting', 'utils/notice', 'client/acceptOffering']);

class LightWeightClient extends React.Component<IProps, IState> {

    private mounted: boolean;
    private firstJobSubscription = null;

    private offerings: ClientOfferingItem[] = [];

    constructor(props: IProps){
        super(props);
        this.state = {
            status: props.channel.getStatus()
           ,selectedLocation: null
           ,locations: null
           ,channel: null
           ,usage: null
           ,ip: null
           ,job: null
           ,offeringItem: {offering: null, rating: 0}
           ,offerings: props.offerings ? props.offerings.getOfferings() : null
           ,sessionsDuration: 0
           ,reconnectTry: 0
        };
    }

    componentDidMount() {

        const { stoppingSupervisor, dispatch, ws, channel, offerings } = this.props;

        this.mounted = true;

        if(!stoppingSupervisor){
            this.refresh();

            dispatch(handlers.setAutoTransfer(true));
            dispatch(asyncProviders.updateAccounts());
            ws.setGUISettings({mode: 'simple'});
            channel.addEventListener('StatusChanged', this.onStatusChanged);
            channel.addEventListener('ipChanged', this.onIpChanged);
            channel.addEventListener('UsageChanged', this.onUsageChanged);
            channel.addEventListener('Connected', this.onConnected);
            channel.addEventListener('Disconnected', this.onDisconnected);
            channel.setMode('simple');

            offerings.addEventListener('*', this.onOfferingsChange);
            offerings.useUnlimitedOnly = true;
            this.onOfferingsChange();

            const status = channel.getStatus();
            if(status !== 'disconnected'){
                this.updateCurrentCountry();
            }
            this.onUsageChanged();
            this.setState({status, ip: channel.getIp()});
        }
    }

    componentWillUnmount(){

        const { dispatch, channel, offerings } = this.props;

        this.mounted = false;
        this.unsubscribe();

        dispatch(handlers.setAutoTransfer(false));

        channel.removeEventListener('StatusChanged', this.onStatusChanged);
        channel.removeEventListener('ipChanged', this.onIpChanged);
        channel.removeEventListener('UsageChanged', this.onUsageChanged);
        channel.removeEventListener('Connected', this.onConnected);
        channel.removeEventListener('Disconnected', this.onDisconnected);
        channel.setMode('advanced');

        offerings.removeEventListener('*', this.onOfferingsChange);
        offerings.useUnlimitedOnly = false;
    }

    onConnected = () => {
        const { t } = this.props;
        notify(t('client/simpleMode:connectedMsg'));
    }

    onDisconnected = () => {
        const { t } = this.props;
        notify(t('client/simpleMode:disconnectedMsg'));
    }

    onOfferingsChange = () => {

        const { offerings } = this.props;
        this.offerings = offerings.getOfferings();

        this.setState({locations: this.getLocations(this.offerings)});
    }

    onStatusChanged = () => {
        const { channel } = this.props;
        this.setState({status: channel.getStatus(), job: channel.getJob()});
    }

    onIpChanged = () => {
        const { channel } = this.props;
        this.setState({ip: channel.getIp()});
    }

    onUsageChanged = () => {
        const { channel } = this.props;
        this.setState({usage: channel.getUsage(), sessionsDuration: channel.getSessionsDuration()});
    }

    private unsubscribe(){

        const { ws } = this.props;

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

    /*
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
   */

    private refresh = async () => {

        if(!this.mounted){
            return;
        }

        const { channel } = this.props;

        if(channel){
            /*

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
           */
          /*
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
           */
        }else{
            switch(this.state.status){
                case 'connecting':
                    break;
                default:
                    this.setState({status: 'disconnected', channel: null, usage: null});
                    break;
            }
        }
    }
/*
    private async hasSessions(channelId: string){

        const { ws } = this.props;

        const sessions = await ws.getSessions(channelId);
        return sessions.length > 0;

    }
*/

/*
    private async failedJob(channel: ClientChannel){

        if(!this.mounted){
            return;
        }

        const { t } = this.props;

        const msg = <>{t('AgentFailed')}<br/>{t('HisRating')}<br/>{t('PleaseTryAgain')}</>;

        notice({level: 'error', header: t('utils/notice:Attention!'), msg});
        await this.uncooperativeClose(channel);

    }
*/
/*
    private async checkCountryAccordance(){

        const { t, ws, channel } = this.props;

        const endpoint = await ws.getEndpoints(channel.model.id);
        if (endpoint[0]) {
            const countryStatus = endpoint[0].countryStatus;
            if (['invalid', 'unknown'].includes(countryStatus)) {
                notice({level: 'error', header: t('utils/notice:Attention!'), msg: t('CountryAlertInvalid')});
                await this.uncooperativeClose();
            }
        }
    }


    private async uncooperativeClose(){

        const { offerings, channel } = this.props;
        const { offeringItem, selectedLocation } = this.state;

        if(offeringItem){
            offerings.addToBlackList(offeringItem.offering);
        }
        this.updateOfferings();
        this.setState({offeringItem: null});
        this.onChangeLocation(selectedLocation);
        if(channel){
            await ws.changeChannelStatus(channel.id, 'terminate');
        }
        if(this.mounted){
            this.setState({offeringItem: null});
            this.onChangeLocation(selectedLocation);
        }
        if(channel){
            await channel.terminate();
            await channel.close();
        }
    }
*/


    private async updateCurrentCountry(){

        const { ws, channel } = this.props;

        if(!this.state.selectedLocation || !this.state.offeringItem){
            const offering = await ws.getOffering(channel.model.offering); // TODO get local
            const country = offering.country.toLowerCase();
            this.setState({selectedLocation: {value: country, label: countryByISO(country)}, offeringItem: {offering, rating: 0}}); // TODO restore rating
        }
    }

    private async connect(offering: Offering){

        const { t, ws, localSettings, account } = this.props;

        let gasPrice = localSettings.gas.defaultGasPrice;
        try {
            const suggestedGasPrice = await ws.suggestGasPrice();
            if(typeof suggestedGasPrice === 'number' && suggestedGasPrice !== 0){
                gasPrice = suggestedGasPrice;
            }
        }catch(e){
            // DO NOTHING
        }

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

        const updatedChannelInfo = await ws.getObject('channel', channel.model.id);
        const usage = await ws.getChannelsUsage([channel.model.id]);

        if(usage[channel.model.id].cost >= updatedChannelInfo.totalDeposit){
            return;
        }

        if(updatedChannelInfo.channelStatus !== 'active'){
            this.setState({status: 'disconnected', channel: null, usage: null});
        }else{
            if(reconnectTry <= localSettings.reconnect.count){
                this.setState({reconnectTry: reconnectTry + 1});
                try {
                    await this.tryToConnect();
                    this.setState({status: 'connected', reconnectTry: 0});
                } catch(e) {
                    setTimeout(this.reconnect, localSettings.reconnect.delay*Math.pow(localSettings.reconnect.progression, reconnectTry));
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
                            reject();
                            break;
                        case 'done':
                            unsubscribe();
                            resolve(true);
                            break;
                    }
                }
            };
            channel.resume();
            subscription = await ws.subscribe('channel', [channel.model.id], eventDispatcher);
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

        const { channel } = this.props;

        channel.terminate();
        this.unsubscribe();
        this.refresh();
    }

    private onResume = () => {

        const { channel } = this.props;
        channel.resume();
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
        log.log('RANGE SELECTED!!!', range);
        const items = offeringsItems.map(offeringItem => ({id: offeringItem.offering.id, rating: offeringItem.rating}));
        const max = Math.max(...items.map(item => item.rating));

        if(max === 0){
            log.log('RATING NOT CALCULATED!!! result:', offeringsItems);
            return offeringsItems;
        }

        const k = 1/max;
        const normalizedItems = items.map(item => ({id: item.id, rating: item.rating*k}));

        const res = normalizedItems.filter(item => item.rating >= range.min && item.rating <= range.max);
        const ids = res.map(item => item.id);
        const offerings = offeringsItems.filter(offeringItem => ids.includes(offeringItem.offering.id));

        if(offerings.length > 0){
            log.log('RESULT: ', offerings);
            return offerings;
        }
        log.log('there are no offerings in selected range, next attempt');
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
            log.log('random offering:', res);
            return res;
        }

        const item = this.selectByProbability(items, Math.random()*k);
        const offering = offerings.find(offeringItem => offeringItem.offering.id === item.id);
        log.log('selected offering: ', offering);
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

            const { usage, ip, selectedLocation, offeringItem, sessionsDuration } = this.state;
            const props = {usage, ip, selectedLocation, offering: offeringItem ? offeringItem.offering : null, onChangeLocation: this.onChangeLocation, onDisconnect: this.onDisconnect, sessionsDuration};
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

        const { t, account, channel, transferring, stoppingSupervisor } = this.props;
        const { status } = this.state;

        if(stoppingSupervisor){
            return <ExitScreen />;
        }

        if(!account || !channel){
            return null;
        }

        return (
            <>
                <Noticer />
                <ExitNotice />
                <NetworkAndVersion className='networkANdBuildVersionSimple' />
                <ExternalLinkWarning />
                <style dangerouslySetInnerHTML={{__html: `
                   html { background: white; } body { background: white; }
                `}} />
                <div className='SMHelpBl'>
                    <ExternalLink
                        href={'https://docs.privatix.network/knowledge-base/simple-and-advanced-client'}
                    ><i className='md md-help'></i> <span>{t('Help')}</span></ExternalLink>
                </div>
                <div className='widget-chart text-center'>

                    <div className='SMBalanceBl'>
                        <div className='SMBalance'>
                            <div className='SMBalanceRow'>
                                <div className='text'>{t('Account')} :</div>
                                <div className='value'>{prix(account.ptcBalance)} PRIX | {eth(account.ethBalance)} ETH</div>
                            </div>
                            <div className='SMBalanceRow'>
                                <div className='text'>{t('Marketplace')} :</div>
                                <div className='value'>{transferring ? <span className='lds-dual-ring-small'></span> : null } {prix(account.pscBalance)} PRIX</div>
                            </div>
                            <div className='SMBalanceRow'>
                                <div className='text'>{t('EscrowLocked')} : </div>
                                <div className='value'>{prix(account.escrow)} PRIX</div>
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
                            href={'https://docs.privatix.network/knowledge-base/how-to-withdraw-funds'}
                        ><span>{t('withdrawal')}</span></ExternalLink> |&nbsp;
                        <ExternalLink
                            href={'https://docs.privatix.network/knowledge-base/terms-of-use'}
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
       ,account
       ,channel: state.channel
       ,offerings: state.offerings
       ,balance: account ? prix(account.pscBalance) : ''
       ,offeringsAvailability: state.offeringsAvailability
       ,transferring: state.transferring
       ,stoppingSupervisor: state.stoppingSupervisor
    };
})(translate(LightWeightClient));
