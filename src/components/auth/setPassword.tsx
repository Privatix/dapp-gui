import * as React from 'react';
import { withRouter } from 'react-router-dom';
import {fetch} from 'utils/fetch';

import * as ReactTooltip from 'react-tooltip';

const NextButton = withRouter(({ history }) => <button
    className='btn btn-pink btn-block text-uppercase waves-effect waves-light'
    type='button'
    id='NextBut'
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
    // const submit = (evt: any) => {
    //     evt.preventDefault();
    //     console.log('click');
    //     (document.getElementById('NextBut') as any).click();
    // };
    return <div className='card-box'>
        <div className='panel-heading'>
            <h4 className='text-center'> Set the password to <strong className='text-custom'>Privatix</strong> </h4>
        </div>
        <div className='p-20'>
            <ul>
                <li> the password must be strong</li>
                <li>
                    <span>In case you lost your password, you lost all your data</span>
                    <span><a data-tip='information about how we store<br/>and encrypt data' data-html={true}> ? </a></span>
                </li>
                <li>We will use this password as a key for encrypting your private key.</li>
            </ul>
            <form className='form-horizontal m-t-20' action='#' >
                <div className='form-group'>
                    <div className='col-12'>
                        <input className='form-control' type='password' id='pwd' required={true} placeholder='Password' />
                    </div>
                </div>
                <div className='form-group'>
                    <div className='col-12'>
                        <input className='form-control' type='password' id='pwd1' required={true} placeholder='Confirmation' />
                    </div>
                </div>
                <div className='form-group text-center m-t-40'>
                    <div className='col-12'>
                        <NextButton />
                    </div>
                </div>
            </form>
            <ReactTooltip place='top' type='dark' effect='float'/>
        </div>
    </div>;
}
