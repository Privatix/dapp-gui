import * as React from 'react';
import { connect } from 'react-redux';
import {shell} from 'electron';

import { Transaction } from 'typings/transactions';

interface IProps {
    transaction: Transaction;
    network: string;
}

export default class Transaction extends React.Component<IProps, {}> {

    render(){

        const { transaction, network } = this.props;

        const etherscan = (evt:any) => {
            evt.preventDefault();
            shell.openExternal(`https://{network}etherscan.io/address/0x${transaction.ethAddr}`);
        };

        return (
            <tr>
                <td>{transaction.date}</td>
                <td> <a href='#' onClick={etherscan}>0x{transaction.ethAddr}</a></td>
            </tr>
        );
    }
}

export default connect( (state: State) => ({network: localSettings.network === 'mainnet' ? '' : `${localSettings.network}.`}) )(Transaction);
