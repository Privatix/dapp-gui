import * as React from 'react';
import { Link } from 'react-router-dom';
import AccountView from './accountView';
import AccountTools from './accountTools';

export default function(props:any){

    const account = JSON.parse(props.match.params.account);

    return <div className='container-fluid'>
        <div className='row'>
            <div className='col-sm-12 m-b-15'>
                <h3 className='page-title'>Account</h3>
            </div>
            <div className='col-sm-12 m-b-20'>
                <Link to={'/accounts'} className='btn btn-default btn-custom waves-effect waves-light'>&lt;&lt;&lt; Back</Link>
            </div>
        </div>
        <div className='row'>
            <AccountView account={account} />
            <AccountTools account={account} />
        </div>
    </div>;
}
