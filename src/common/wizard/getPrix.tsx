import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { translate, Trans } from 'react-i18next';

import { asyncProviders } from 'redux/actions';
import { Mode } from 'typings/mode';

import ExternalLink from 'common/etc/externalLink';
import CopyToClipboard from 'common/copyToClipboard';

import { WS, ws } from 'utils/ws';
import notice from 'utils/notice';

import Steps from './steps';
import { PreviousButton, FinishButton, back } from './utils';
import Spinner from './spinner';

interface IProps{
    ws?: WS;
    t?: any;
    dispatch?: any;
    history?: any;
    accountId: string;
    entryPoint: string;
}

interface IState {
    accountId: string;
    ethAddr: string;
    didIt: boolean;
    getPrix: boolean;
    done: boolean;
}

@translate(['auth/getPrix', 'auth/generateKey', 'auth/utils'])
class GetPrix extends React.Component<IProps, IState>{

    private observerId = null;

    constructor(props:IProps){
        super(props);
        this.state = {ethAddr: '', didIt: false, getPrix: false, done: false, accountId: props.accountId};
    }

    isSimpleMode(){
        const { accountId } = this.props;
        return !accountId || accountId === 'generate';
    }

    async componentDidMount(){

        const { ws, t, accountId } = this.props;

        if(!this.isSimpleMode()){
            ws.getAccount(accountId)
              .then(account => {
                  this.setState({ethAddr: `0x${account.ethAddr}`});
              });
        }else{
            // simple mode!
            const payload = {
                isDefault: true
               ,inUse: true
               ,name: 'main'
            };

            try {
                const accountId = await ws.generateAccount(payload);
                await ws.setGUISettings({accountCreated:true});
                ws.getAccount(accountId)
                  .then(account => {
                      this.setState({accountId, ethAddr: `0x${account.ethAddr}`});
                  });
            } catch (e){
                const msg = t('auth/generateKey:SomethingWentWrong');
                notice({level: 'error', header: t('utils/notice:Attention!'), msg});
            }
        }
    }

    componentWillUnmount() {
        if(this.observerId){
            clearTimeout(this.observerId);
        }
    }

    private startObserveAccountBalance = async () => {

        const { ws } = this.props;
        const { accountId } = this.state;

        const account = await ws.getAccount(accountId);
        if(account.ptcBalance !== 0 && account.ethBalance !== 0){
            this.setState({getPrix: true});
            this.observerId = null;
            this.transferTokens();
        }else{
            this.observerId = setTimeout(this.startObserveAccountBalance, 3000);
        }
    }

    private transferTokens = async () => {
        const { ws } = this.props;
        const { accountId  } = this.state;

        const account = await ws.getAccount(accountId);
        const settings = await ws.getSettings();

        await ws.transferTokens(accountId, 'psc', account.ptcBalance, parseFloat(settings['eth.default.gasprice'].value));
        this.startObserveServiceBalance();
    }

    private startObserveServiceBalance = async () => {

        const { ws } = this.props;
        const { accountId } = this.state;

        const account = await ws.getAccount(accountId);
        if(account.pscBalance !== 0 ){
            this.setState({done: true});
            this.observerId = null;
        }else{
            this.observerId = setTimeout(this.startObserveServiceBalance, 3000);
        }
    }

    private back = back(`/backup/${this.props.accountId}/generateKey`).bind(this);

    private onSubmit = (evt: any) => {

        evt.preventDefault();
        this.setState({didIt: true});
        this.startObserveAccountBalance();
    }

    private onFinish = (evt: any) => {

        const { entryPoint, dispatch } = this.props;
        evt.preventDefault();
        if(this.isSimpleMode()){
            dispatch(asyncProviders.setMode(Mode.SIMPLE));
        }else{
            dispatch(asyncProviders.setMode(Mode.ADVANCED));
        }
        this.props.history.push(entryPoint);

    }

    render(){

        const { t, accountId } = this.props;
        const { ethAddr, didIt, getPrix, done } = this.state;
        const advancedMode = accountId && accountId !== 'generate';

        return <div className='card-box'>
            <div className='panel-heading'>
                <h4 className='text-center'>PRIX</h4>
            </div>
            <div className='form-horizontal m-t-20'>
                <div className='p-20 wizard clearfix'>
                    <Steps step={advancedMode ? 6 : 3} prix={true} shape={advancedMode ? 'advanced' : 'simple' } />
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
                                            <span style={ {paddingLeft: '9px', paddingRight: '16px'} }
                                                  className='input-group-addon bootstrap-touchspin-postfix'>
                                                <CopyToClipboard text={ethAddr} />
                                            </span>
                                    </div>
                                    <br />
                                </li>
                                <li>
                                    <Trans i18nKey='PostIntoBot'>
                                        <p>Open Telegram and send this address to <ExternalLink href='https://t.me/prixbot'>{'@prixbot'}</ExternalLink> for airdrop (ETH/PRIX).</p>
                                    </Trans>
                                </li>
                                <li>
                                    <p>{t('PressButton')}</p>
                                    <div className='form-group row'>
                                        <div className='col-md-12'>
                                            {didIt
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
                                    {didIt && (!getPrix || !done)
                                        ? <div className='text-center'>
                                              {getPrix
                                                  ? <>
                                                      <div>{t('TokensHaveBeenReceived')}</div>
                                                      <div>{t('WeAreTransferring')}</div>
                                                    </>
                                                  : t('PleaseWait')
                                              }
                                              <Spinner />
                                          </div>
                                        : null
                                    }
                                    <h4 className='text-center'>
                                        {done ? t('AllDonePressFinish') : null }
                                    </h4>
                                </li>
                            </ol>
                            <div className='form-group text-right m-t-40'>
                                {advancedMode ? <PreviousButton onSubmit={this.back} /> : null }
                                {done
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
