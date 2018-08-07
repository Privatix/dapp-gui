import * as React from 'react';
import { connect } from 'react-redux';
import {fetch} from '../utils/fetch';
import {asyncProviders} from '../redux/actions';
import {Account} from '../typings/accounts';
import {State} from '../typings/state';
import {Mode} from '../typings/mode';
import * as api from '../utils/api';

interface Props {
    accounts: Account[];
    rate?: number;
    mode: Mode;
    dispatch: any;
}

class TopPanel extends React.Component <Props, any>{

    constructor(props: any){
        super(props);
        this.state = {
            status: false,
            mode: '',
            handler: 0,
            changeMode: false,
            pscCount: 0,
            totalTraffic: 0,
            trafficBalance: '0',
            ethBalance: 0,
            ptcBalance: 0,
            pscBalance: 0
        };
    }

    componentDidMount() {
        this.update();
    }

    componentWillUnmount() {
        this.setState({handler: 0});
        clearTimeout(this.state.handler);
    }

    componentDidUpdate() {
        this.checkModeChange();
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: any) {

        const ethBalance = (nextProps.accounts.reduce((balance, account) => {
            return account.ethBalance + balance;
        }, 0)/1e18).toFixed(3);
        const ptcBalance = (nextProps.accounts.reduce((balance, account) => {
            return account.ptcBalance + balance;
        }, 0)/1e8).toFixed(3);
        const pscBalance = (nextProps.accounts.reduce((balance, account) => {
            return account.psc_balance + balance;
        }, 0)/1e8).toFixed(3);

        return {
            ethBalance: ethBalance,
            ptcBalance: ptcBalance,
            pscBalance: pscBalance,
            mode: nextProps.mode,
            changeMode: true
        };
    }

    async update(){

        const rate = this.props.rate ? this.props.rate : 3000;

        this.props.dispatch(asyncProviders.updateAccounts());

        if (this.props.mode === Mode.AGENT) {
            await this.updateAgent();
        }else {
            await this.updateClient();
        }
        this.setState({handler: setTimeout(this.update.bind(this), rate)});
    }

    shouldComponentUpdate(props: any, state: any){
        const diff = Object.keys(state).filter(key => this.state[key] !== state[key]);

        if(diff.length === 1 && diff[0] === 'handler'){
            return false;
        }
        if(diff.length === 1 && diff[0] === 'changeMode'){
            return false;
        }

        return diff.length > 0;
    }

    updateAgent() {
        api.channels.getList('active').then(res => {
            const pscCount = (res as any).length;
            this.setState({status: pscCount > 0, pscCount });
        });
    }

    updateClient() {
        fetch('/client/channels?channelStatus=active', {}).then((res:any) => {
            const activeConnections = res.length;
            let totalTraffic = '0';
            // let trafficBalance = 0;
            if (activeConnections > 0) {
                const traffic = res[0].usage;
                totalTraffic = String(traffic.current) + ' ' + traffic.unit.toUpperCase();
                // trafficBalance = (traffic.maxUsage - traffic.current) + ' ' + traffic.unit.toUpperCase();
            }


            this.setState({
                status: activeConnections > 0,
                totalTraffic
                /* ,trafficBalance */
            });
        });
    }

    checkModeChange() {
        if (this.state.handler && this.state.changeMode) {
            clearTimeout(this.state.handler);
            this.setState({changeMode: false});
            this.update();
        }
    }

    render(){
        const status = this.state.status ? 'on' : 'off';
        if(this.props.mode === 'agent'){
            return <ul className='list-inline float-right mb-0 topPanel'>
                <li className='list-inline-item'>ETH Balance: {this.state.ethBalance}</li>
                <li className='list-inline-item'>Exchange Balance: {this.state.ptcBalance}</li>
                <li className='list-inline-item'>Service balance: {this.state.pscBalance}</li>
                <li className='list-inline-item'>Active Services: {this.state.pscCount}</li>
                <li className='list-inline-item m-r-20 topPanelStatusLi'> Status: <span className={`statusWrap statusWrap-${status}`}><i className={`fa fa-toggle-${status}`}></i></span></li>
            </ul>;
        }else{
            return <ul className='list-inline float-right mb-0 topPanel'>
                <li className='list-inline-item'>ETH Balance: {this.state.ethBalance}</li>
                <li className='list-inline-item'>Exchange Balance: {this.state.ptcBalance}</li>
                <li className='list-inline-item'>Service balance: {this.state.pscBalance}</li>
                <li className='list-inline-item'>Total Traffic: {this.state.totalTraffic}</li>
                {/*<li className='list-inline-item'>Traffic Balance: {this.state.trafficBalance}</li>*/}
                {/*<li className='list-inline-item m-r-20 topPanelStatusLi'> Status: <span className={`statusWrap statusWrap-${status}`}><i className={`fa fa-toggle-${status}`}></i></span></li>*/}
            </ul>;
        }
    }
}

export default connect( (state: State) => ({accounts: state.accounts}) )(TopPanel);
