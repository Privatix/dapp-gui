import * as React from 'react';
import { Link } from 'react-router-dom';

export default function(props:any){
    const elem = <tr>
        <td><Link to={`/account/${JSON.stringify(props.account)}`}>{props.account.name}</Link></td>
        <td>{props.account.ethAddr}</td>
        <td>{props.account.ethBalance}</td>
        <td>{props.account.ptcBalance}</td>
        <td>{props.account.pscBalance}</td>
        <td>{props.account.inUse}</td>
        <td>{props.account.isDefault}</td>
    </tr>;
    return (elem);
}
