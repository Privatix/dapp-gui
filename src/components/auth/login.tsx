import * as React from 'react';
import { withRouter } from 'react-router-dom';
// import keythereum = require('keythereum');

import {fetch} from 'utils/fetch';

// import * as ReactTooltip from 'react-tooltip';
const pwdIsCorrect = function(pwd: string){
    return pwd.trim() !== '';
};



export default function(props: any){

    const LoginButton = withRouter(({ history }) => <button
        type='button'
        onClick={async (evt: any) => {
            evt.preventDefault();
            console.log('BUTTON!');
            const pwd = (document.getElementById('pwd') as any).value.trim();
            if(pwdIsCorrect(pwd)){
                const body = {pwd};
                const res = await fetch('/login', {method: 'post', body});
                console.log(res, body);
                history.push('/app'); 
            }else{
                // TODO incorrect password
            }
          }
        }
      >
        Login
      </button>
    );

    return <div> 
    <h3>Login</h3>
    <form>
        <label>Password: <input type='password' id='pwd' /></label>
        <hr />
        <LoginButton />
    </form>
    </div>;
}
