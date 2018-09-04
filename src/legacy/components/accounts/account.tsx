import * as React from 'react';
import AccountView from '../../../components/accounts/accountView';

export default function(props:any){

    return <div className='container-fluid'>
        <div className='row'>
            <AccountView account={props.account} />
            {/*<AccountTools {...props} />*/}
        </div>
    </div>;
}
