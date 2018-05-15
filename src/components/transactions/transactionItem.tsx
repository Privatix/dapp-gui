import * as React from 'react';
import {shell} from 'electron';

export default function(props:any){
    const etherscan = (evt:any) => {
        evt.preventDefault();
        shell.openExternal(`https://etherscan.io/address/0x${props.transaction.ethAddr}`);
    };
    const elem = <tr>
        <td>{props.transaction.date}</td>
        <td> <a href='#' onClick={etherscan}>0x{props.transaction.ethAddr}</a></td>
    </tr>;
    return (elem);
}
