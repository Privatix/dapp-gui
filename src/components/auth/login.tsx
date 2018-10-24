import * as React from 'react';
import { withRouter } from 'react-router-dom';
import * as api from '../../utils/api';
import { connect } from 'react-redux';

import { WS } from '../../utils/ws';
import {fetch} from '../../utils/fetch';
import notice from '../../utils/notice';
import i18n from '../../i18next/init';
import handlers from '../../redux/actions';

const pwdIsCorrect = function(pwd: string){
    return pwd.trim() !== '';
};

class Login extends React.Component<any, any> {

    onSubmit(evt: any){
        evt.preventDefault();
        // TODO ???
        (document.getElementById('but') as any).click();
    }

    render(){

        const LoginButton = withRouter(({ history }) => <button
            className='btn btn-pink btn-block text-uppercase waves-effect waves-light'
            type='button'
            id='but'
            onClick={async (evt: any) => {
                evt.preventDefault();
                const pwd = (document.getElementById('pwd') as any).value.trim();
                if(pwdIsCorrect(pwd)){

                    const settings = await api.settings.getLocal();
                    const ws = new WS(settings.wsEndpoint);
                    const ready = await ws.whenReady();
                    if(ready){
                        try {
                            // TODO remove when /accounts/${props.account.id}/status will be implemented on ws
                            const body = {pwd};
                            await fetch('/login', {method: 'post', body});
                            await ws.setPassword(pwd);
                            // TODO notice if server returns error (not implemented on dappctrl yet)
                            (window as any).ws = ws;
                            this.props.dispatch(handlers.setWS(ws));
                            const mode = await api.getUserRole();
                            this.props.dispatch(handlers.setMode(mode));
                            history.push(this.props.entryPoint);
                        }catch(e){
                            notice({level: 'error', header: i18n.t('utils/notice:Attention!'), msg: i18n.t('login:AccessDenied')});
                        }
                    }else{
                        // TODO
                    }
                }else{
                    // TODO incorrect password
                }
              }
            }
          >
            {i18n.t('login:Login')}
          </button>
        );

        return <div className='card-box'>
            <div className='panel-heading'>
                <h4 className='text-center'> {i18n.t('login:LoginTo')} <strong className='text-custom'>Privatix</strong></h4>
            </div>
            <div className='p-20'>
                <form className='form-horizontal m-t-20' onSubmit={this.onSubmit}>
                    <div className='form-group'>
                        <div className='col-12'>
                            <input className='form-control' type='password' id='pwd' required={true} placeholder={i18n.t('login:Password')} />
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
}

export default connect(state => state)(Login);
