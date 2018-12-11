import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import {asyncProviders} from '../redux/actions';
import {Account} from '../typings/accounts';
import {State} from '../typings/state';

import { WS } from '../utils/ws';

interface Props {
    accounts: Account[];
    rate?: number;
    dispatch: any;
    t: any;
    ws: WS;
}
@translate(['topPanel'])
class TopPanel extends React.Component <Props, any>{

    constructor(props: any){
        super(props);
        this.state = {
            handler: 0,
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
            pscBalance: pscBalance
        };
    }

    async update(){

        const rate = this.props.rate ? this.props.rate : 3000;

        this.props.dispatch(asyncProviders.updateAccounts());

        this.setState({handler: setTimeout(this.update.bind(this), rate)});
    }


    render(){

        const { t } = this.props;

        return <ul className='list-inline float-right mb-0 topPanel'>
            <li className='list-inline-item'>{t('ETHBalance')}: {this.state.ethBalance}</li>
            <li className='list-inline-item'>{t('ExchangeBalance')}: {this.state.ptcBalance}</li>
            <li className='list-inline-item'>{t('ServiceBalance')}: {this.state.pscBalance}</li>
        </ul>;
    }
}

export default connect( (state: State) => ({accounts: state.accounts, ws: state.ws}) )(TopPanel);
