import * as React from 'react';
import { withRouter } from 'react-router-dom';
import {fetch} from 'utils/fetch';

import * as ReactTooltip from 'react-tooltip';

const NextButton = withRouter(({ history }) => <button
    type='button'
    onClick={async (evt: any) => {
        evt.preventDefault();
        console.log('BUTTON!');
        const res = await fetch('/auth', {method: 'post'});
        console.log(res);
        history.push('/setAccount'); 
      }
    }
  >
    Next
  </button>
);

export default function(props: any){
    return <div> 
    <h3>Set the password</h3>
    <ul>
        <li> the password must be strong</li>
        <li>
            <span>In case you lost your password, you lost all your data</span>
            <span><a data-tip='information about how we store<br/>and encrypt data' data-html={true}> ? </a></span>
        </li>
        <li>We will use this password as a key for encrypting your private key.</li>
    </ul>
    <form>
        <label>Password <input type='password' /></label>
        <label>Confirmation <input type='password'/></label>
        <hr />
        <NextButton />
    </form>
    <ReactTooltip place='top' type='dark' effect='float'/>
    </div>;
}
