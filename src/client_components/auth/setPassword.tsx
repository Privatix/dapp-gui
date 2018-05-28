import * as React from 'react';
import Steps from './steps';
import { withRouter } from 'react-router-dom';
import {fetch} from 'Utils/fetch';

import * as ReactTooltip from 'react-tooltip';


const NextButton = withRouter(({ history }) => <button
    className='btn btn-default text-uppercase waves-effect waves-light pull-right'
    type='button'
    id='NextBut'
    onClick={async (evt: any) => {
        evt.preventDefault();
        const pwd = (document.getElementById('pwd') as any).value;
        const conf = (document.getElementById('pwd1') as any).value;
        console.log('BUTTON!', pwd, conf);
        const res = await fetch('/auth', {method: 'post', body: {password: pwd}});
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
        <form className='form-horizontal m-t-20' id='setupForm' action='#' >
        <div className='p-20 wizard clearfix'>
                <Steps step='1' />
                <div className='content clearfix'>
                    <section>
                        <p> The password must be strong.</p>
                        <p className='row'>
                            <span className='col-11'>In case you lost your password, you lost all your data. It is NOT possible to access your account without a password and there is no forgot my password option here. Do not forget it.</span>
                            <span className='col-1 pull-right'><a data-tip='information about how we store<br/>and encrypt data' data-html={true} className='font-18'><i className='md md-help' /> </a></span>
                        </p>
                        <p>We will use this password as a key for encrypting your private key.</p>
                        
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
                        <div className='form-group text-right m-t-40'>
                            <div className='col-12'>
                                <NextButton />
                            </div>
                        </div>
                        <ReactTooltip place='top' type='dark' effect='float'/>
                    </section>
                </div>
        </div>
        </form>
    </div>;
}

