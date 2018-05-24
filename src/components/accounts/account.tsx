import * as React from 'react';
import AccountView from './accountView';
import AccountTools from './accountTools';

export default function(props:any){

    const account = props.account;

    return <div className='container-fluid'>
        <div className='row'>
            <AccountView account={account} />
            <AccountTools account={account} />
        </div>
    </div>;
}
