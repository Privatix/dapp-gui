import * as React from 'react';
import Steps from './steps';
import {LocalSettings} from '../../typings/settings';
import { withRouter } from 'react-router-dom';
import {fetch} from '../../utils/fetch';
import notice from '../../utils/notice';
import * as ReactTooltip from 'react-tooltip';
import {NextButton} from './utils';

class SetPassword extends React.Component<any, any>{

    constructor(props:any){
        super(props);
        this.state = {pwd: '', conf: ''};
    }

    equality(){

        if(this.state.pwd === '' || this.state.conf === ''){
            return 'neutral';
        }

        if (this.state.pwd.length !== this.state.conf.length) {
            return 'wrong';
        }

        const cond = this.state.pwd.length  > this.state.conf.length;
        const max =  cond ? this.state.pwd : this.state.conf;
        const min = !cond ? this.state.pwd : this.state.conf;

        return max.substr(0, min.length) === min ? 'correct' : 'wrong';
    }

    onUserInput(evt:any){
        console.log(evt);
        this.setState({[evt.target.dataset.payloadValue]: evt.target.value.trim()});
    }

    async onSubmit(evt: any){

        evt.preventDefault();

        const {pwd, conf} = this.state;
        let msg = '';
        let err = false;

        if(pwd !== conf){
            msg += 'Password and confirmation are not equal!';
            err = true;
        }

        if(pwd.length < 8 || pwd.length > 24){
            msg += ' Password length must be at least 8 and at most 24 symbols.';
            err = true;
        }

        if(err){
            notice({level: 'error', header: 'Attention!', msg});
            return;
        }

        const res = await fetch('/auth', {method: 'post', body: {password: pwd}});
        // TODO notice if server returns error (not implemented on dappctrl yet)
        console.log(res);

        const settings = (await fetch('/localSettings', {})) as LocalSettings;
        settings.firstStart = false;
        await fetch('/localSettings', {method: 'post', body: settings});
        this.props.history.push('/setAccount');
    }

    render(){

        return <div className='card-box'>
            <div className='panel-heading'>
                <h4 className='text-center'> Set the password to <strong className='text-custom'>Privatix</strong> </h4>
            </div>
            <form className='form-horizontal m-t-20' action='#' onSubmit={this.onSubmit.bind(this)} >
            <div className='p-20 wizard clearfix'>
                    <Steps step='1' />
                    <div className='content clearfix'>
                        <section className='setPasswordsBl'>
                            <p> The password must be strong.</p>
                            <p className='row'>
                                <span className='col-11'>
                                    In case you lost your password, you lost all your data. It is NOT possible to access your account without a password and there is no forgot my password option here. Do not forget it.
                                </span>
                                <span className='col-1 pull-right'>
                                    <a data-tip='information about how we store<br/>and encrypt data' data-html={true} className='font-18'>
                                        <i className='md md-help' />
                                    </a>
                                </span>
                            </p>
                            <p>We will use this password as a key for encrypting your private key.</p>
                            <div className='form-group'>
                                <div className='col-12'>
                                    <input
                                        className={[this.equality(), 'form-control'].join(' ')}
                                        type='password'
                                        data-payload-value='pwd'
                                        required={true}
                                        placeholder='Password'
                                        onChange={this.onUserInput.bind(this)}
                                        value={this.state.pwd}
                                    />
                                </div>
                            </div>
                            <div className='form-group'>
                                <div className='col-12'>
                                    <input
                                        className={[this.equality(), 'form-control'].join(' ')}
                                        type='password'
                                        data-payload-value='conf'
                                        required={true}
                                        placeholder='Confirmation'
                                        onChange={this.onUserInput.bind(this)}
                                        value={this.state.conf}
                                    />
                                </div>
                            </div>
                            <div className='form-group text-right m-t-40'>
                                <div className='col-12'>
                                    <NextButton onSubmit={this.onSubmit.bind(this)} />
                                </div>
                            </div>
                            <ReactTooltip place='top' type='dark' effect='float'/>
                        </section>
                    </div>
            </div>
            </form>
        </div>;
    }
}

export default withRouter(SetPassword);
