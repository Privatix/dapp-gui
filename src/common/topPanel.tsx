import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import {Account} from 'typings/accounts';
import {State} from 'typings/state';

interface Props {
    accounts?: Account[];
    t?: any;
}

interface IState {

}

@translate(['topPanel'])
class TopPanel extends React.Component <Props, IState>{

    render(){

        const { t, accounts } = this.props;

        const ethBalance = (accounts.reduce((balance, account) => (account.ethBalance + balance), 0) / 1e18).toFixed(3);
        const ptcBalance = (accounts.reduce((balance, account) => (account.ptcBalance + balance), 0) / 1e8).toFixed(3);
        const pscBalance = (accounts.reduce((balance, account) => (account.pscBalance + balance), 0) / 1e8).toFixed(3);

        return <ul className='list-inline float-right mb-0 topPanel'>
            <li className='list-inline-item'>{t('ETHBalance')}: {ethBalance}</li>
            <li className='list-inline-item'>{t('ExchangeBalance')}: {ptcBalance}</li>
            <li className='list-inline-item'>{t('ServiceBalance')}: {pscBalance}</li>
        </ul>;
    }
}

export default connect( (state: State) => ({accounts: state.accounts}) )(TopPanel);
