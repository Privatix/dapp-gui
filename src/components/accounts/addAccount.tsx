import * as React from 'react';
import { withRouter } from 'react-router-dom';
import Toggle from 'react-toggle';
import { Link } from 'react-router-dom';
// import keythereum = require('keythereum');

import {fetch} from 'Utils/fetch';

import * as ReactTooltip from 'react-tooltip';

const createPrivateKey = function(){
    return Buffer.from('11111111111111111111111111111111').toString('base64');
};

var isDefault = false;

const trim = function(key: string){
    key = key.trim().toLowerCase();
    if(key.length > 1 && key.substring(0, 2) === '0x'){
        key = key.substring(2);
    }
    return key;
};

const keyIsCorrect = function(key: string){
    return true;
};



export default withRouter(function(props: any){

const handler = async (evt: any, privateKey, history: any) => {
    const name = props.default ? 'default' : trim((document.getElementById('accountName') as any).value);
    evt.preventDefault();
    if(keyIsCorrect(privateKey)){
        const body = {privateKey
                     ,isDefault
                     ,inUse: true
                     ,name
                     ,type: 'generate_new'
        };
        const res = await fetch('/accounts/', {method: 'POST', body});
        console.log(res);
        // history.push(props.default ? '/' : '/accounts'); 
    }else{
        // TODO incorrect private key message
    }
};

const GenerateNewAccButton = withRouter(
    ({ history }) => <button type='button'
        className='btn btn-pink btn-block text-uppercase waves-effect waves-light'
        onClick={(evt: any) => {
        const privateKey = createPrivateKey();
        handler(evt, privateKey, history);
    }}>
        Generate a new account
    </button>
);

const UseThisButton = withRouter(
    ({ history }) => <button type='button'
        className='btn btn-pink btn-block text-uppercase waves-effect waves-light'
        onClick={(evt: any) => {
        const privateKey = trim((document.getElementById('privateKey') as any).value);
        handler(evt, privateKey, history);
    }}>
        Use this
    </button>
);

    const handleToggleChange = function(){
        isDefault = !isDefault;
    };

    isDefault = props.default;

    return <div className='container-fluid'>
        <div className='card-box'>
        <div className='row'>
            <div className='col-sm-12 m-b-15'>
                <div className='btn-group pull-right'>
                    <Link to={'/accounts'} className='btn btn-default waves-effect waves-light'>&lt;&lt;&lt; Back</Link>
                </div>
                <h3 className='page-title'>{props.default ? 'Set the contract account' : 'Create an Account'}</h3>
            </div>
        </div>
        <form className='form-horizontal m-t-20'>
        {props.default ? '' 
            : <div><div className='form-group row'>
                <label className='col-3 col-form-label'>Name:</label>
                <div className='col-9'>
                    <input className='form-control' type='text' defaultValue='Test' id='accountName' />
                </div>
            </div>
            <div className='form-group row'>
                <label className='col-3 col-form-label'>Is default:</label>
                <div className='col-9'>
                    <Toggle defaultChecked={'checked'} onChange={handleToggleChange} />
                </div>
            </div></div>
        }
            <p>For token transfers, you need to add your Private Key for address that holds PRIX</p>
            <p>We recommend you:</p>
                <ul>
                    <li>create a separate account</li>
                    <li>transfer to them limited amount of PRIX and ETH</li>
                    <li>use this separate account in this application</li>
                </ul>
            <GenerateNewAccButton />
            <p className='m-b-0 m-t-20 text-center font-16'>-- or -- </p>
            <div className='form-group'>
                <div className='col-12'>
                    <label>Private key:</label>
                    <textarea className='form-control' id='privateKey' required={true} placeholder='Private key' />
                </div>
            </div>
        <UseThisButton />
    </form>
    <ReactTooltip place='top' type='dark' effect='float'/>
        </div></div>;
});
