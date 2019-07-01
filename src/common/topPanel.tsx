import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import eth from 'utils/eth';
import prix from 'utils/prix';

import {Account} from 'typings/accounts';
import {State} from 'typings/state';

interface Props {
    accounts?: Account[];
    t?: any;
}

@translate(['topPanel'])
class TopPanel extends React.Component <Props, {}>{

    render(){

        const { t, accounts } = this.props;

        const ethBalance = eth(accounts.reduce((balance, account) => (account.ethBalance + balance), 0));
        const ptcBalance = prix(accounts.reduce((balance, account) => (account.ptcBalance + balance), 0));
        const pscBalance = prix(accounts.reduce((balance, account) => (account.pscBalance + balance), 0));

        return <ul className='list-inline float-right mb-0 topPanel'>
            <li className='list-inline-item'>{t('ETHBalance')}: {ethBalance}</li>
            <li className='list-inline-item'>{t('ExchangeBalance')}: {ptcBalance}</li>
            <li className='list-inline-item'>{t('ServiceBalance')}: {pscBalance}</li>
        </ul>;
    }
}

export default connect( (state: State) => ({accounts: state.accounts}) )(TopPanel);
