import * as React from 'react';
import { withRouter } from 'react-router-dom';
// import keythereum = require('keythereum');

import {fetch} from 'utils/fetch';

import * as ReactTooltip from 'react-tooltip';

const createPrivateKey = function(){
    return '5318b4d5bcd28de64ee5559e671353e16f075ecae9f99c7a79a38af5f869aa46';
};

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

const UseThisButton = withRouter(({ history }) => <button
    type='button'
    onClick={async (evt: any) => {
        evt.preventDefault();
        console.log('BUTTON!');
        const privateKey = trim((document.getElementById('privateKey') as any).value);
        if(keyIsCorrect(privateKey)){
            const body = {privateKey
                         ,isDefault: true
                         ,inUse: true
                         ,name: 'default'
            };
            const res = await fetch('/accounts', {method: 'post', body});
            console.log(res, body);
            history.push('/'); 
        }else{
            // TODO incorrect private key message
        }
      }
    }
  >
    Use this
  </button>
);

const GenerateNewAccButton = withRouter(({ history }) => <button
    type='button'
    onClick={async (evt: any) => {
        evt.preventDefault();
        console.log('BUTTON!');
        const privateKey = createPrivateKey();
        const body = {privateKey
                     ,isDefault: true
                     ,inUse: true
                     ,name: 'default'
        };
        const res = await fetch('/accounts', {method: 'post', body});
        console.log(res);
        history.push('/'); 
      }
    }
  >
    Generate a new account
  </button>
);

export default function(props: any){
    return <div> 
    <h3>Set the contract account</h3>
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
        Private key:
    </ul>
    <form>
        <label>Private key: <input type='text' id='privateKey' /></label>
        <hr />
        <UseThisButton />
    </form>
    <ReactTooltip place='top' type='dark' effect='float'/>
    </div>;
}
