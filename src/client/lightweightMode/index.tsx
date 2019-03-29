import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import Select from 'react-select';

import JobName from 'common/badges/jobName';
import CopyToClipboard from 'common/copyToClipboard';

import SwitchAdvancedModeButton from './switchAdvancedModeButton';

import toFixed from 'utils/toFixedN';
import notice from 'utils/notice';
import countryByISO from 'utils/countryByIso';

import { State } from 'typings/state';
import {Account} from 'typings/accounts';


class SelectCountryOption extends React.Component<any, any> {

    onClick = () => {
        this.props.onSelect(this.props.option);
    }

    render(){
        const { label, cost } = this.props.option;
        return (
            <div onClick={this.onClick} style={ {display: 'flex', justifyContent: 'space-between'} } >
                <span style={ {margin: '5px'} } >{label}</span><span style={ {margin: '5px'} } >{cost}</span>
            </div>
        );
    }
}


interface IProps {
    ws: State['ws'];
    localSettings: State['localSettings'];
    t?: any;
    gasPrice: number;
    account: Account;
    balance: string;
}

@translate(['client/simpleMode', 'client/dashboard/connecting', 'utils/notice', 'client/acceptOffering'])
class LightWeightClient extends React.Component<IProps, any> {

    subscription: string;
    usageSubscription = undefined;
    acceptBtn = null;
    optimalLocations: any[];
    optimalLocation: any;

    constructor(props: IProps){
        super(props);
        this.acceptBtn = React.createRef();
        this.state = { status: 'disconnected', offerings: [], ip: '' };
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
    }

    async getIp(){
        const res = await fetch('https://api.ipify.org?format=json');
        const json = await res.json();
        this.setState({ip: json.ip});
    }

    refresh = async () => {

        const { ws } = this.props;

        const channels = await ws.getNotTerminatedClientChannels();

        if(this.subscription){
            await ws.unsubscribe(this.subscription);
        }

        if(channels.length){

            const ids = channels.map(channel => channel.id);
            this.subscription = await ws.subscribe('channel', ids, this.refresh);
            const channel = channels[0];
            this.setState({channel});
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
                    }
                    break;
                case 'terminating':
                    this.setState({status: 'disconnecting'});
                    break;
            }
        }else{
            if(this.state.status !== 'connecting'){
                this.setState({status: 'disconnected'});
                const clientOfferings = await ws.getClientOfferings('', 0, 0, [], 0, 0);
                this.setState({offerings: clientOfferings.items.filter(offering => offering.currentSupply !== 0)});
            }else{
                setTimeout(this.refresh, 1000);
            }

        }
    }

    subscribeUsage = async () => {
        const { ws } = this.props;
        const { channel } = this.state;

        const usage = await ws.getChannelsUsage([channel.id]);
        this.setState({usage: usage[channel.id]});
        this.usageSubscription = setTimeout(this.subscribeUsage, 3000);
    }

    getOffering(){
        const currentLocation = this.getCurrentLocation();
        return this.optimalLocations[currentLocation.value];

    }

    onConnect = async (evt: any) => {

        evt.preventDefault();

        this.setState({status: 'connecting'});

        const { t, ws, localSettings, gasPrice, account } = this.props;

        const offering = this.getOffering();
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
            msg = t('ErrorAcceptingOffering');
            notice({level: 'error', header: t('utils/notice:Attention!'), msg});
        }
    }

    onDisconnect = () => {

        const { ws } = this.props;
        const { channel } = this.state;

        ws.changeChannelStatus(channel.id, 'terminate');
        this.setState({status: 'disconnecting', ip: ''});
    }

    changeLocation = (optimalLocation: any) => {
        this.setState({optimalLocation});
    }

    getOptimalLocation(locations: any[]){
        return locations[Math.floor(Math.random()*locations.length)];
    }

    getLocations(){

        const { offerings } = this.state;

        if(!offerings){
            return {};
        }

        if(!this.optimalLocations || Object.keys(this.optimalLocations).length === 0){
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

            this.optimalLocations = countries;
        }

        return Object.keys(this.optimalLocations).map(country => {
            const offering = this.optimalLocations[country];
            const price = toFixed({number: offering.unitPrice/1e8, fixed: 8});
            const unitName = offering.unitName;
            return {value: country, label: countryByISO(country), cost: `${price} / ${unitName}`};
        });
    }

    getCurrentLocation(){
        if(this.state.optimalLocation){
            return this.state.optimalLocation;
        }
        if(this.optimalLocation){
            return this.optimalLocation;
        }
        const countries = Object.keys(this.optimalLocations);
        if(countries.length){
            const country = countries[Math.floor(Math.random()*countries.length)];
            const optimalLocation =  {value: country, label: countryByISO(country)};
            this.optimalLocation = optimalLocation;
            return optimalLocation;
        }else{
            return {};
        }
    }

    connected(){

        const { t } = this.props;
        const { usage, ip, channel } = this.state;

        const offerings = this.getLocations();
        const selectedOffering = this.getCurrentLocation();
        const secondsTotal = Math.floor((Date.now() - Date.parse(channel.job.createdAt))/1000);
        const seconds = secondsTotal%60;
        const minutes = ((secondsTotal - seconds)/60)%60;
        const hours = (secondsTotal - minutes*60 - seconds)/(60*60);

        return (
            <>
                <h6 className='text-muted'>IP: {ip}</h6>
                <br/>
                <div className='content clearfix content-center'>
                    <div className='col-3' style={ {margin: 'auto'} }>
                        <Select className='form-control btn btn-white'
                                value={selectedOffering}
                                searchable={false}
                                clearable={false}
                                options={offerings}
                                disabled={true}
                        />
                    </div>
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
        const { channel } = this.state;

        const offerings = this.getLocations();
        const selectedOffering = this.getCurrentLocation();

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

        return (
            <>
                <div className='content clearfix content-center'>
                    <div className='col-3' style={ {margin: 'auto'} }>
                        <Select className='form-control btn btn-white'
                                value={selectedOffering}
                                searchable={false}
                                clearable={false}
                                options={offerings}
                                disabled={true}
                        />
                    </div>
                </div>
                <br />
                <button type='button' disabled className='btn btn-primary btn-custom btn-rounded waves-effect waves-light'>
                    {t('Connecting')}
                </button>
                <br />
                <br />
                <progress
                    style={ {margin: 'auto', width: '300px'} }
                    className='progress-bar progress-bar-primary wow animated progress-animated'
                    value={channel ? currentStep(channel.job.jobtype) : 0}
                    max={steps.length}
                />

                {channel ? <JobName className='text-muted' jobtype={channel.job.jobtype} /> : null }
            </>
        );
    }

    disconnected(){

        const { t } = this.props;

        const offerings = this.getLocations();
        const selectedOffering = this.getCurrentLocation();

        return (
            <>
                <div className='content clearfix content-center'>
                    <div className='col-3' style={ {margin: 'auto'} }>
                        <Select className='form-control btn btn-white'
                                value={selectedOffering}
                                searchable={false}
                                clearable={false}
                                options={offerings}
                                onChange={this.changeLocation}
                                optionComponent={SelectCountryOption}
                        />
                    </div>
                </div>
                <br/>
                <br/>
                <button type='button' onClick={this.onConnect} className='btn btn-primary btn-custom btn-rounded waves-effect waves-light'>
                    {t('Connect')}
                </button>
            </>
        );
    }

    disconnecting(){

        const { t } = this.props;
        const { channel } = this.state;

        const offerings = this.getLocations();
        const selectedOffering = this.getCurrentLocation();

        const steps = ['completeServiceTransition'
                      ,'clientPreServiceTerminate'
        ];

        const currentStep = function(step: string){
            const i = steps.indexOf(step);
            return i !== -1 ? i + 1 : 0;
        };

        return (
            <>
                <div className='content clearfix content-center'>
                    <div className='col-3' style={ {margin: 'auto'} }>
                        <Select className='form-control btn btn-white'
                                value={selectedOffering}
                                searchable={false}
                                clearable={false}
                                options={offerings}
                                disabled={true}
                        />
                    </div>
                </div>
                <br />
                <button type='button' disabled className='btn btn-primary btn-custom btn-rounded waves-effect waves-light'>
                    {t('Disconnecting')}
                </button>
                <br />
                <br />
                <progress
                    style={ {margin: 'auto', width: '300px'} }
                    className='progress-bar progress-bar-primary wow animated progress-animated'
                    value={channel ? currentStep(channel.job.jobtype) : 0}
                    max={steps.length}
                />

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
                        <img src='images/logo_big.png' alt='image' className='img-fluid' width='200' />
                        <br />
                        <br />
                        <img src='images/PrivatixNetwork.png' width='400px' height='100px' />
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
    };
})(LightWeightClient);