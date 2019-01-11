import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { translate, Trans } from 'react-i18next';

import ExternalLink from 'common/etc/externalLink';
import CopyToClipboard from 'common/copyToClipboard';

import { WS, ws } from 'utils/ws';
// import notice from 'utils/notice';

import Steps from './steps';
import { PreviousButton, FinishButton, back } from './utils';
import Spinner from './spinner';

interface IProps{
    ws?: WS;
    t?: any;
    history?: any;
    accountId: string;
    entryPoint: string;
}

@translate(['auth/getPrix', 'auth/utils'])
class GetPrix extends React.Component<IProps, any>{

    observerId = null;

    constructor(props:IProps){
        super(props);
        this.state = {ethAddr: '', didIt: false, done: false};
    }

    componentDidMount(){
        const { ws, accountId } = this.props;
        ws.getAccount(accountId)
          .then(account => {
              this.setState({ethAddr: `0x${account.ethAddr}`});
          });
    }

    componentWillUnmount() {
        if(this.observerId){
            clearTimeout(this.observerId);
        }
    }

    startObserve = async () => {

        const { ws, accountId } = this.props;

        const account = await ws.getAccount(accountId);
        if(account.ethBalance !== 0 || account.ptcBalance !== 0 ){
            this.setState({done: true});
            this.observerId = null;
        }else{
            this.observerId = setTimeout(this.startObserve, 3000);
        }
    }

    back = back(`/backup/${this.props.accountId}/generateKey`).bind(this);

    onSubmit = (evt: any) => {

        evt.preventDefault();
        this.setState({didIt: true});
        this.startObserve();
    }

    onFinish = (evt: any) => {

        const { entryPoint } = this.props;
        evt.preventDefault();
        this.props.history.push(entryPoint);

    }

    render(){

        const { t } = this.props;
        const { ethAddr } = this.state;

        return <div className='card-box'>
            <div className='panel-heading'>
                <h4 className='text-center'>PRIX</h4>
            </div>
            <div className='form-horizontal m-t-20'>
                <div className='p-20 wizard clearfix'>
                    <Steps step={6} prix={true} />
                    <div className='content clearfix'>
                        <section>
                            <p>{t('WeAreCurrentlyOnTestnet')}</p>
                            <p>{t('YouShouldGetPRIXandETH')}</p>
                            <ol>
                                <li>
                                    <p>{t('CopyTheAddress')}</p>
                                    <div className='input-group bootstrap-touchspin'>
                                            <input className='form-control'
                                                   readOnly
                                                   type='text'
                                                   defaultValue={ethAddr}
                                            />
                                            <span className='input-group-addon bootstrap-touchspin-postfix'><CopyToClipboard text={ethAddr} /></span>
                                    </div>
                                    <br />
                                </li>
                                <li>
                                    <Trans i18nKey='PostIntoBot'>
                                        <p>Post it into <ExternalLink href='https://t.me/prixbot'>{'Privatix\'s bot chat'}</ExternalLink>.</p>
                                    </Trans>
                                </li>
                                <li>
                                    <p>{t('PressButton')}</p>
                                    <div className='form-group row'>
                                        <div className='col-md-12'>
                                            {this.state.didIt
                                                ?<button className='btn btnCustomDisabled btn-block disabled' >{t('IdidIt')}</button>
                                                :<button type='submit'
                                                        onClick={this.onSubmit}
                                                        className='btn btn-default btn-lg btn-custom btn-block waves-effect waves-light'
                                                >
                                                    {t('IdidIt')}
                                                </button>
                                            }
                                        </div>
                                    </div>
                                    {this.state.didIt && !this.state.done
                                        ? <div className='text-center'>
                                              {t('PleaseWait')}
                                              <Spinner />
                                          </div>
                                        : null
                                    }
                                    <h4 className='text-center'>
                                        {this.state.done ? t('AllDonePressFinish') : null }
                                    </h4>
                                </li>
                            </ol>
                            <div className='form-group text-right m-t-40'>
                                <PreviousButton onSubmit={this.back} />
                                {this.state.done
                                    ? <FinishButton onSubmit={this.onFinish} />
                                    : <button className='btn btn-default text-uppercase waves-effect waves-light pull-right m-l-5 btnCustomDisabled disabled' >
                                          {t('auth/utils:Finish')}
                                      </button>
                                }
                           </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default ws<IProps>(withRouter(GetPrix));
