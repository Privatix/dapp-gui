import * as React from 'react';
import {shell} from 'electron';

import { Transaction } from 'typings/transactions';

interface IProps {
    transaction: Transaction;
}

export default function(props: IProps){

    const { transaction } = props;

    const etherscan = (evt:any) => {
        evt.preventDefault();
        shell.openExternal(`https://etherscan.io/address/0x${transaction.ethAddr}`);
    };

    return (
        <tr>
            <td>{transaction.date}</td>
            <td> <a href='#' onClick={etherscan}>0x{transaction.ethAddr}</a></td>
        </tr>
    );

}
