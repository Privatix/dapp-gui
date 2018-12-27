import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import * as ReactTooltip from 'react-tooltip';

import {NextButton, PreviousButton, back} from './utils';
import Steps from './steps';

import { registerBugsnag } from 'utils/bugsnag';
import {default as notice, closeNotice } from 'utils/notice';
import * as api from 'utils/api';
import handlers from 'redux/actions';
import { WS } from 'utils/ws';

@translate(['auth/setPassword', 'utils/notice'])
class SetPassword extends React.Component<any, any>{

    private submitted = false;

    constructor(props:any){
        super(props);
        this.state = {pwd: '', conf: ''};
    }

    back = back('/').bind(this);

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown = (evt: any) => {
        if (evt.keyCode === 13 && !this.submitted) {
            this.onSubmit(evt);
        }
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
        this.setState({[evt.target.dataset.payloadValue]: evt.target.value.trim()});
    }

    onSubmit = async (evt: any) => {
        this.submitted = true;
        const { t } = this.props;
        evt.preventDefault();

        const {pwd, conf} = this.state;
        let msg = '';
        let err = false;

        if(pwd !== conf){
            msg += t('PasswordAndConfirmationAreNotEqual');
            err = true;
        }

        if(pwd.length < 8 || pwd.length > 24){
            msg += ' ' + t('PasswordLengthMustBe');
            err = true;
        }

        if(err){
            notice({level: 'error', header: t('utils/notice:Attention!'), msg});
            this.submitted = false;
            return;
        }

        await api.settings.updateLocal({firstStart:false});
        const settings = await api.settings.getLocal();
        const ws = new WS(settings.wsEndpoint);
        notice({level: 'info', header: t('utils/notice:Attention!'), msg: t('TryToConnect')}, 60*60*1000);
        const ready = await ws.whenReady();
        closeNotice();
        if(ready){
            try {
                await ws.setPassword(pwd);
                (window as any).ws = ws;
                registerBugsnag(ws);
                this.props.dispatch(handlers.setWS(ws));
                const role = await ws.getUserRole();
                this.props.dispatch(handlers.setMode(role));
                this.props.history.push('/setAccount');
            }catch(e){
                notice({level: 'error', header: t('utils/notice:Attention!'), msg: t('AccessDenied')});
                this.submitted = false;
            }
        }else{
            // TODO
        }
    }

    render(){
        const { t } = this.props;
        return <div className='card-box'>
            <div className='panel-heading'>
                <h4 className='text-center'> {t('setThePassword')} <strong className='text-custom'>Privatix</strong></h4>
            </div>
            <form className='form-horizontal m-t-20' action='#' onSubmit={this.onSubmit.bind(this)} >
                <div className='p-20 wizard clearfix'>
                    <Steps step='2' />
                    <div className='content clearfix'>
                        <section className='setPasswordsBl'>
                            <p> {t('ThePasswordMustBeStrong')}</p>
                            <p className='row'>
                                <span className='col-11'>
                                {t('InCaseYouLostYourPassword')}
                                </span>
                                <span className='col-1 pull-right'>
                                    <a data-tip={t('WeStoreYourPrivateKeys')} data-html={true} className='font-18'>
                                        <i className='md md-help' />
                                    </a>
                                </span>
                            </p>
                            <p>{t('WeWillUseThisPassword')}</p>
                            <div className='form-group'>
                                <div className='col-12'>
                                    <input
                                        className={[this.equality(), 'form-control'].join(' ')}
                                        type='password'
                                        data-payload-value='pwd'
                                        required={true}
                                        placeholder={t('Password')}
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
                                        placeholder={t('Confirmation')}
                                        onChange={this.onUserInput.bind(this)}
                                        value={this.state.conf}
                                    />
                                </div>
                            </div>
                            <div className='form-group text-right m-t-40'>
                                <div className='col-12'>
                                    <PreviousButton onSubmit={this.back} />
                                    <NextButton onSubmit={this.onSubmit} />
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

export default connect(state => state)(withRouter(SetPassword));
