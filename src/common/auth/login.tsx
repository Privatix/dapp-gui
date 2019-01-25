import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { registerBugsnag } from 'utils/bugsnag';
import { WS } from 'utils/ws';
import {default as notice, closeNotice } from 'utils/notice';
import { translate } from 'react-i18next';
import handlers from 'redux/actions';
import {State} from 'typings/state';

interface Props {
    entryPoint: any;
    dispatch?: any;
    t?: any;
    ws?: WS;
}

@translate('login', 'utils/notice')
class Login extends React.Component<any, any> {

    private submitted = false;

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
        if (evt.keyCode === 13 && !this.submitted) {
            this.submitted = true;
            await this.login();
        }
    }

    async onSubmit(evt: any){
        evt.preventDefault();
        if(!this.submitted){
            this.submitted = true;
            await this.login();
        }
    }

    pwdIsCorrect(pwd: string){
        return pwd.trim() !== '';
    }

    async login() {

        const pwd = this.state.password.trim();
        const { t, ws, entryPoint } = this.props;

        if (this.pwdIsCorrect(pwd)) {
            notice({level: 'info', header: t('utils/notice:Attention!'), msg: t('TryToConnect')}, 0);
            const ready = await ws.whenReady();
            closeNotice();
            if (ready) {
                try {
                    await ws.setPassword(pwd);
                    // TODO notice if server returns error (not implemented on dappctrl yet)
                    registerBugsnag(ws);
                    const role = await ws.getUserRole();
                    this.props.dispatch(handlers.setMode(role));
                    this.props.history.push(entryPoint);
                } catch(e) {
                    notice({level: 'error', header: t('utils/notice:Attention!'), msg: t('login:AccessDenied')});
                    this.submitted = false;
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

        const { t } = this.props;

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
            {t('Login')}
          </button>;

        return <div className='card-box'>
            <div className='panel-heading'>
                <h4 className='text-center'> {t('LoginTo')} <strong className='text-custom'>Privatix</strong></h4>
            </div>
            <div className='p-20'>
                <form className='form-horizontal m-t-20' onSubmit={this.onSubmit.bind(this)}>
                    <div className='form-group'>
                        <div className='col-12'>
                            <input className='form-control'
                                   type='password'
                                   id='pwd'
                                   required={true}
                                   placeholder={t('Password')}
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

export default connect( (state: State, ownProps: Props) => {
    return Object.assign({}, {ws: state.ws}, ownProps);
} )(withRouter(Login));
