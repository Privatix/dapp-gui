import * as React from 'react';
import { withRouter } from 'react-router-dom';
import * as api from '../../utils/api';
import { connect } from 'react-redux';

import { WS } from 'utils/ws';
import notice from 'utils/notice';
import i18n from 'i18next/init';
import handlers from 'redux/actions';
import {State} from 'typings/state';

interface Props {
    entryPoint: any;
    dispatch?: any;
    t?: any;
}

class Login extends React.Component<any, any> {

    constructor(props: any) {
        super(props);

        this.state = {
            password: ''
        };
    }

    componentDidMount() {
        // For login on Enter key press when password input is not focused (CTO requirement)
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    async handleKeyPress(evt: any) {
        if (evt.keyCode === 13) {
            await this.login();
        }
    }

    async onSubmit(evt: any){
        evt.preventDefault();
        await this.login();
    }

    pwdIsCorrect(pwd: string){
        return pwd.trim() !== '';
    }

    async login() {
        const pwd = this.state.password.trim();

        if (this.pwdIsCorrect(pwd)) {
            const settings = await api.settings.getLocal();
            const ws = new WS(settings.wsEndpoint);
            const ready = await ws.whenReady();

            if (ready) {
                try {
                    await ws.setPassword(pwd);
                    // TODO notice if server returns error (not implemented on dappctrl yet)
                    (window as any).ws = ws;
                    this.props.dispatch(handlers.setWS(ws));
                    const role = await ws.getUserRole();
                    this.props.dispatch(handlers.setMode(role));
                    this.props.history.push(this.props.entryPoint);
                } catch(e) {
                    notice({level: 'error', header: i18n.t('utils/notice:Attention!'), msg: i18n.t('login:AccessDenied')});
                }
            } else {
                // TODO
            }
        } else {
            // TODO incorrect password
        }
    }

    changePwd(e: any) {
        const password = e.target.value;
        this.setState({password});
    }

    render(){

        const LoginButton = () => <button
            className='btn btn-pink btn-block text-uppercase waves-effect waves-light'
            type='button'
            id='but'
            onClick={async (evt: any) => {
                evt.preventDefault();
                await this.login();
              }
            }
          >
            {i18n.t('login:Login')}
          </button>;

        return <div className='card-box'>
            <div className='panel-heading'>
                <h4 className='text-center'> {i18n.t('login:LoginTo')} <strong className='text-custom'>Privatix</strong></h4>
            </div>
            <div className='p-20'>
                <form className='form-horizontal m-t-20' onSubmit={this.onSubmit.bind(this)}>
                    <div className='form-group'>
                        <div className='col-12'>
                            <input className='form-control'
                                   type='password'
                                   id='pwd'
                                   required={true}
                                   placeholder={i18n.t('login:Password')}
                                   onChange={this.changePwd.bind(this)} />
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

export default connect( (state: State, onProps: Props) => {
    return (onProps);
} )(withRouter(Login));
