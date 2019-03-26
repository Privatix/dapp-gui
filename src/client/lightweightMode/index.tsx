import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import JobName from 'common/badges/jobName';

import  SwitchAdvancedModeButton from './switchAdvancedModeButton';

// import toFixedN from 'utils/toFixedN';
import notice from 'utils/notice';

import { State } from 'typings/state';
import {Account} from 'typings/accounts';

interface IProps {
    ws: State['ws'];
    localSettings: State['localSettings'];
    t?: any;
    gasPrice: number;
    account: Account;
}

@translate(['client/dashboard/connecting', 'utils/notice', 'client/acceptOffering'])
class LightWeightClient extends React.Component<IProps, any> {

    subscription: string;
    acceptBtn = null;

    constructor(props: IProps){
        super(props);
        this.acceptBtn = React.createRef();
        this.state = { status: 'disconnected', offerings: [] };
    }

    componentDidMount() {
        this.refresh();
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
            this.setState({channel});
            switch(channel.channelStatus.serviceStatus){
                case 'active':
                    this.setState({status: 'connected'});
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
            this.setState({status: 'disconnected'});
            const clientOfferings = await ws.getClientOfferings('', 0, 0, [], 0, 0);
            console.log('Offerings', clientOfferings);
            this.setState({offerings: clientOfferings.items.filter(offering => offering.currentSupply !== 0)});

        }

    }

    getOffering(){
        return this.state.offerings[0];
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
            return;
        }

        try {
            const channelId = await ws.acceptOffering(account.ethAddr, offering.id, customDeposit, gasPrice);
            console.log(channelId);
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
        this.setState({status: 'disconnecting'});
    }

    connected(){
        return (
            <div>
                <SwitchAdvancedModeButton />
                <div className='widget-chart text-center'>
                    <div id='sparkline3'>
                        <h5>Balance: 40 PRIX</h5>
                        <img src='https://user-images.githubusercontent.com/13798583/54585788-a9031700-4a4d-11e9-8a86-e32727901939.png' alt='image' className='img-fluid' width='200' />

                        <h1>Connected</h1>
                        <h6 className='text-muted'>IP: 145.15.98.36</h6>
                        <br/>

                        <button type='button' className='btn dropdown-toggle btn-white' data-toggle='dropdown' title='Combo 1'
                                aria-expanded='true'><span className='filter-option pull-left'>Optimal Location</span>&nbsp;<span
                                className='bs-caret'><span className='caret'></span></span></button>


                        <br/>
                        <br/>
                        <button type='button' onClick={this.onDisconnect} className='btn btn-primary btn-custom btn-rounded waves-effect waves-light'>Disconnect
                        </button>
                    </div>


                    <ul className='list-inline m-t-15'>
                        <li>
                            <h6 className='text-muted m-t-20'>TIME</h6>
                            <h2 className='m-t-20'>10:11:43</h2>
                            <h4 className='text-muted  m-b-0'>hh:mm:ss</h4>
                        </li>
                        <li>
                            <h6 className='text-muted m-t-20'>TRAFFIC</h6>
                            <h2 className='m-t-20'>100</h2>
                            <h4 className='text-muted m-b-0'>MB</h4>
                        </li>
                        <li>
                            <h6 className='text-muted m-t-20'>SPENT</h6>
                            <h2 className='m-t-20'>0.0001</h2>
                            <h4 className='text-muted m-b-0'>PRIX</h4>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }

    connecting(){

        const {channel } = this.state;

        return (
            <div>
                <SwitchAdvancedModeButton />
                <div className='widget-chart text-center'>
                    <div id='sparkline3'>
                        <h5>Balance: 40 PRIX</h5>
                        <img src='https://user-images.githubusercontent.com/13798583/54585788-a9031700-4a4d-11e9-8a86-e32727901939.png' alt='image' className='img-fluid' width='200' />

                        <h1>Connecting</h1>

                    </div>

                    {channel ? <JobName jobtype={channel.job.jobtype} /> : null }
                </div>
            </div>
        );
    }

    disconnected(){
        return (
            <div>
                <SwitchAdvancedModeButton />
                <div className='widget-chart text-center'>
                    <div id='sparkline3'>
                        <h5>Balance: 40 PRIX</h5>
                        <img src='https://user-images.githubusercontent.com/13798583/54585788-a9031700-4a4d-11e9-8a86-e32727901939.png' alt='image' className='img-fluid' width='200' />

                        <h1>Disconnected</h1>
                        <br/>

                        <button type='button' className='btn dropdown-toggle btn-white' data-toggle='dropdown' title='Combo 1'
                                aria-expanded='true'><span className='filter-option pull-left'>Optimal Location</span>&nbsp;<span
                                className='bs-caret'><span className='caret'></span></span></button>


                        <br/>
                        <br/>
                        <button type='button' onClick={this.onConnect} className='btn btn-primary btn-custom btn-rounded waves-effect waves-light'>Connect
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    disconnecting(){

        const {channel } = this.state;

        return (
            <div>
                <SwitchAdvancedModeButton />
                <div className='widget-chart text-center'>
                    <div id='sparkline3'>
                        <h5>Balance: 40 PRIX</h5>
                        <img src='https://user-images.githubusercontent.com/13798583/54585788-a9031700-4a4d-11e9-8a86-e32727901939.png' alt='image' className='img-fluid' width='200' />

                        <h1>Disconnecting</h1>
                        <br/>

                        <button type='button' className='btn dropdown-toggle btn-white' data-toggle='dropdown' title='Combo 1'
                                aria-expanded='true'><span className='filter-option pull-left'>Optimal Location</span>&nbsp;<span
                                className='bs-caret'><span className='caret'></span></span></button>


                    </div>

                    <JobName jobtype={channel.job.jobtype} />

                </div>
            </div>
        );
    }

    render(){
        console.log(this.state.status);
        return this[this.state.status]();
    }
}

export default connect((state: State) => ({
    ws: state.ws
   ,localSettings: state.localSettings
   ,gasPrice: parseFloat(state.settings['eth.default.gasprice'])
   ,account: state.accounts.find((account: Account) => account.isDefault)
}))(LightWeightClient);
