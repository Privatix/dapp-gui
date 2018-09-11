import * as React from 'react';
import { withRouter } from 'react-router-dom';
import * as api from '../../utils/api';
import WS from '../../utils/ws';
import {fetch} from '../../utils/fetch';
import notice from '../../utils/notice';

const pwdIsCorrect = function(pwd: string){
    return pwd.trim() !== '';
};

export default function(props: any){

    const submit = (evt: any) => {
        evt.preventDefault();
        (document.getElementById('but') as any).click();
    };

    const LoginButton = withRouter(({ history }) => <button
        className='btn btn-pink btn-block text-uppercase waves-effect waves-light'
        type='button'
        id='but'
        onClick={async (evt: any) => {
            evt.preventDefault();
            const pwd = (document.getElementById('pwd') as any).value.trim();
            if(pwdIsCorrect(pwd)){
                const body = {pwd};
                const res = await fetch('/login', {method: 'post', body});
                if(res){

                    api.settings.getLocal()
                       .then(settings => {
                            const ws = new WS(settings.wsEndpoint);
                            ws.setPassword(pwd);
                            (window as any).ws = ws;
                       });

                    history.push(props.entryPoint);
                }else{
                    notice({level: 'error', header: 'Attention!', msg: 'access denied, possibly wrong password'});
                }
            }else{
                // TODO incorrect password
            }
          }
        }
      >
        Login
      </button>
    );

    return <div className='card-box'>
        <div className='panel-heading'>
            <h4 className='text-center'> Login to <strong className='text-custom'>Privatix</strong></h4>
        </div>
        <div className='p-20'>
            <form className='form-horizontal m-t-20' onSubmit={submit}>
                <div className='form-group'>
                    <div className='col-12'>
                        <input className='form-control' type='password' id='pwd' required={true} placeholder='Password' />
                    </div>
                </div>

                <div className='form-group text-center m-t-40'>
                    <div className='col-12'>
                        <LoginButton />
                    </div>
                </div>
            </form>
        </div>
    </div>;
}
