import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import {asyncProviders} from '../redux/actions';
import {Account} from '../typings/accounts';
import {State} from '../typings/state';
import {Mode} from '../typings/mode';

import { WS } from '../utils/ws';

interface Props {
    accounts: Account[];
    rate?: number;
    mode: Mode;
    dispatch: any;
    t: any;
    ws: WS;
}
@translate(['topPanel'])
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
            return account.pscBalance + balance;
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

    async updateAgent() {

        const { ws } = this.props;

        const channels = await ws.getAgentChannels('active', 'active', 0, 0);
        const pscCount = channels.items.length;
        this.setState({status: pscCount > 0, pscCount });
    }

    async updateClient() {

        const { ws } = this.props;

        const channels = await ws.getClientChannels('active', 'active', 0, 0);
        const activeConnections = channels.items.length;
        let totalTraffic = '0 MB';
        if (activeConnections > 0) {
            const usage = await Promise.all(channels.items.map(channel => ws.getChannelUsage(channel.id)));
            const traffic = channels.items.reduce((traffic, item, i) => traffic + usage[i], 0);

            totalTraffic = String(traffic) + ' MB';
        }


        this.setState({
            status: activeConnections > 0,
            totalTraffic
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

        const { t } = this.props;

        const status = this.state.status ? 'on' : 'off';
        if(this.props.mode === 'agent'){
            return <ul className='list-inline float-right mb-0 topPanel'>
                <li className='list-inline-item'>{t('ETHBalance')}: {this.state.ethBalance}</li>
                <li className='list-inline-item'>{t('ExchangeBalance')}: {this.state.ptcBalance}</li>
                <li className='list-inline-item'>{t('ServiceBalance')}: {this.state.pscBalance}</li>
                <li className='list-inline-item'>{t('ActiveServices')}: {this.state.pscCount}</li>
                <li className='list-inline-item m-r-20 topPanelStatusLi'> {t('Status')}: <span className={`statusWrap statusWrap-${status}`}><i className={`fa fa-toggle-${status}`}></i></span></li>
            </ul>;
        }else{
            return <ul className='list-inline float-right mb-0 topPanel'>
                <li className='list-inline-item'>{t('ETHBalance')}: {this.state.ethBalance}</li>
                <li className='list-inline-item'>{t('ExchangeBalance')}: {this.state.ptcBalance}</li>
                <li className='list-inline-item'>{t('ServiceBalance')}: {this.state.pscBalance}</li>
                <li className='list-inline-item'>{t('TotalTraffic')}: {this.state.totalTraffic}</li>
                {/*<li className='list-inline-item'>Traffic Balance: {this.state.trafficBalance}</li>*/}
                {/*<li className='list-inline-item m-r-20 topPanelStatusLi'> Status: <span className={`statusWrap statusWrap-${status}`}><i className={`fa fa-toggle-${status}`}></i></span></li>*/}
            </ul>;
        }
    }
}

export default connect( (state: State) => ({accounts: state.accounts, ws: state.ws}) )(TopPanel);
