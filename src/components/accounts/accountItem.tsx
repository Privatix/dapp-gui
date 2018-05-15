import * as React from 'react';
import { Link } from 'react-router-dom';

export default function(props:any){
    const elem = <tr>
        <td><Link to={`/account/${JSON.stringify(props.account)}`}>{props.account.name}</Link></td>
        <td>0x{Buffer.from(props.account.ethAddr, 'base64').toString('hex')}</td>
        <td>{(props.account.ethBalance/1e8).toFixed(3)}</td>
        <td>{(props.account.ptcBalance/1e8).toFixed(3)}</td>
        <td>{(props.account.psc_balance/1e8).toFixed(3)}</td>
        <td>{String(props.account.inUse)}</td>
        <td>{String(props.account.isDefault)}</td>
    </tr>;
    return (elem);
}
