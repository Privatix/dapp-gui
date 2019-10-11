import * as React from 'react';
import { connect } from 'react-redux';
import { WithTranslation, withTranslation } from 'react-i18next';

import eth from 'utils/eth';
import prix from 'utils/prix';

import {Account} from 'typings/accounts';
import {State} from 'typings/state';

interface IProps extends WithTranslation {
    accounts?: Account[];
}

const translate = withTranslation(['topPanel']);

class TopPanel extends React.Component <IProps, {}>{

    render() {

        const { t, accounts } = this.props;

        const ethBalance = eth(accounts.reduce((balance, account) => (account.ethBalance + balance), 0));
        const ptcBalance = prix(accounts.reduce((balance, account) => (account.ptcBalance + balance), 0));
        const pscBalance = prix(accounts.reduce((balance, account) => (account.pscBalance + balance), 0));
        const escrow = prix(accounts.reduce((escrow, account) => (account.escrow + escrow), 0));

        return <ul className='list-inline float-right mb-0 topPanel'>
            <li className='list-inline-item mr-0'><span className='balanceText'>{t('Account')}:</span> {ptcBalance} PRIX&nbsp;&nbsp;{ethBalance} ETH |&nbsp;</li>
            <li className='list-inline-item mr-0'><span className='balanceText'>{t('Marketplace')}:</span> {pscBalance} PRIX |&nbsp;</li>
            <li className='list-inline-item mr-0'><span className='balanceText'>{t('Escrow')}:</span> {escrow} PRIX</li>
        </ul>;
    }
}

export default connect( (state: State) => ({accounts: state.accounts}) )(translate(TopPanel));
