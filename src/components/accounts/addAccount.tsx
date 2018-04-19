import * as React from 'react';
import { withRouter } from 'react-router-dom';
import Toggle from 'react-toggle';
// import keythereum = require('keythereum');

import {fetch} from 'utils/fetch';

import * as ReactTooltip from 'react-tooltip';

const createPrivateKey = function(){
    return '5318b4d5bcd28de64ee5559e671353e16f075ecae9f99c7a79a38af5f869aa46';
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
    console.log('BUTTON!');
    if(keyIsCorrect(privateKey)){
        const body = {privateKey
                     ,isDefault
                     ,inUse: true
                     ,name
        };
        const res = await fetch('/accounts', {method: 'post', body});
        console.log(res);
        history.push(props.default ? '/' : '/accounts'); 
    }else{
        // TODO incorrect private key message
    }
};

const GenerateNewAccButton = withRouter(
    ({ history }) => <button type='button' onClick={(evt: any) => {
        const privateKey = createPrivateKey();
        handler(evt, privateKey, history);
    }}>
        Generate a new account
    </button>
);

const UseThisButton = withRouter(
    ({ history }) => <button type='button' onClick={(evt: any) => {
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

    return <div> 
    <h3>{props.default ? 'Set the contract account' : 'Create an Account'}</h3>
    <form>
        {props.default ? '' 
            : <div>
                <label>Name: <input type='text' defaultValue='Test' id='accountName' /></label>
                <br />
                <label>Is default:
                    <Toggle defaultChecked={false} onChange={handleToggleChange} />
                </label>
            </div>
        }
        <ul>
            <li>
                <span>For token transfers, you need to add your Private Key for address that holds PRIX</span>
                <span><a data-tip='Link to the<br />user guide' data-html={true}> ? </a></span>
            </li>
            <li>We recommend you:
                <ul>
                    <li>create a separate account</li>
                    <li>transfer to them limited amount of PRIX and ETH</li>
                    <li>use this separate account in this application</li>
                </ul>
            </li>
            <GenerateNewAccButton /><br />
            -- or -- <br/>
        </ul>
        <label>Private key: <input type='text' id='privateKey' /></label>
        <hr />
        <UseThisButton />
    </form>
    <ReactTooltip place='top' type='dark' effect='float'/>
    </div>;
});
