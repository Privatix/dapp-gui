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


import * as QRCode from 'qrcode';

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
                  this.drawQRcode(`0x${account.ethAddr}`);
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
                      this.drawQRcode(`0x${account.ethAddr}`);
                  });
            } catch (e){
                const msg = t('auth/generateKey:SomethingWentWrong');
                notice({level: 'error', header: t('utils/notice:Attention!'), msg});
            }
        }
    }

    private drawQRcode(str: string){
        const canvas = document.getElementById('qrCode');

        QRCode.toCanvas(canvas, str, {width: 200}, function (error: any) {
            if (error){
                console.error(error);
            }
        });
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
                            <table>
                                <tbody>
                                    <tr>
                                        <td style={ {verticalAlign: 'top', width: '30' } } >
                                            <i className='fa fa-info-circle' style={ {fontSize:'22px', color: 'deepskyblue'} }></i>
                                        </td>
                                        <td>
                                            <p>
                                                <i>{t('intro')}&nbsp;
                                                    <ExternalLink href='https://help.privatix.network/general/short-explanation-of-core-simple-ui-client'>
                                                    {t('learnMore')}
                                                    </ExternalLink>.
                                                </i>
                                            </p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <h4>{t('fundYourAccount')}</h4>

                            <hr />

                            <h5>{t('option1')} {t('directDeposit')}</h5>

                            <div>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <ol>
                                                    <li>{t('transferPRIX')}</li>
                                                    <li>
                                                        <Trans i18nKey='weRecommend'>
                                                            We recommend transferring min 0.005 ETH and min 1 PRIX. Learn about price formation&nbsp;
                                                            <ExternalLink href='https://help.privatix.network/general/price-formation'>here</ExternalLink>
                                                        </Trans>
                                                    </li>
                                                    <li>
                                                        <Trans i18nKey='thisOptionIsGood'>
                                                            This option is good for users who already have PRIX and ETH. If you didn't,&nbsp;
                                                            <ExternalLink href='https://help.privatix.network/general/how-to-get-prix-token'>
                                                                learn how to get them
                                                            </ExternalLink>
                                                        </Trans>
                                                    </li>
                                                </ol>
                                                <h6>{t('accountAddress')}</h6>
                                                <div className='input-group bootstrap-touchspin'>
                                                    <input className='form-control'
                                                           readOnly type='text'
                                                           defaultValue={ethAddr}
                                                    />
                                                    <span style={ {paddingLeft: '9px', paddingRight: '16px'} }
                                                          className='input-group-addon bootstrap-touchspin-postfix'>
                                                        <CopyToClipboard text={ethAddr} />
                                                    </span>
                                                </div>
                                            </td>
                                            <td align='right' style={ {verticalAlign: 'bottom', width: '40%'} }>
                                               <canvas id='qrCode'></canvas>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <hr />

                            <h5><b>{t('option2')} {t('easySwap')}</b></h5>

                            <div>
                                <ol>
                                    <li>{t('transferPopularCrypto')}</li>
                                    <li>
                                        <Trans i18nKey='weRecommendOption2'>
                                            We recommend transferring min $10 of crypto equivalent.&nbsp;
                                            <ExternalLink href={`https://swap.privatix.network/?addr=${ethAddr}`}>
                                                learn how to get them
                                            </ExternalLink>
                                        </Trans>
                                    </li>
                                    <li>{t('thisOptionIsGoodOption2')}</li>
                                </ol>
                            </div>

                            <hr />

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
