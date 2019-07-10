import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { translate, Trans } from 'react-i18next';

import { default as handlers, asyncProviders } from 'redux/actions';

import ExternalLink from 'common/etc/externalLink';
import CopyToClipboard from 'common/copyToClipboard';
import HintComponent from 'common/hintComponent';

import Steps from './steps';
import { PreviousButton, FinishButton, back } from './utils';
import Spinner from './spinner';

import { State } from 'typings/state';
import { Mode } from 'typings/mode';
import drawQrCode from 'utils/qrCode';

interface IProps{
    ws?: State['ws'];
    t?: any;
    dispatch?: any;
    history?: any;
    accountId: string;
    entryPoint: string;
    mode: 'simple' | 'advanced';
    notices?: State['notices'];
    isModal?: boolean;
}

interface IState {
    accountId: string;
    ethAddr: string;
    didIt: boolean;
    getPrix: boolean;
    done: boolean;
    err: boolean;
    accountPSCBalance: number;
}

@translate(['auth/getPrix', 'auth/generateKey', 'auth/utils', 'transferTokens'])
class GetPrix extends React.Component<IProps, IState>{

    static getDerivedStateFromProps(props: IProps, state: IState){
        return {err: props.notices.findIndex(notice => notice.code === 0) !== -1};
    }

    private observerId = null;

    constructor(props:IProps){
        super(props);

        this.state = {ethAddr: '', didIt: false, getPrix: false, done: false, err: false, accountId: props.accountId, accountPSCBalance: 0};
    }

    isSimpleMode(){
        const { mode } = this.props;
        return mode === 'simple';
    }

    async componentDidMount(){
        const { ws, accountId, dispatch } = this.props;

        const account = await ws.getAccount(accountId);
        this.setState({ethAddr: `0x${account.ethAddr}`, accountPSCBalance: account.pscBalance});
        drawQrCode(`0x${account.ethAddr}`);
        dispatch(handlers.setAutoTransfer(true));
    }

    componentWillUnmount() {

        const { dispatch } = this.props;

        if(this.observerId){
            clearTimeout(this.observerId);
        }

        dispatch(handlers.setAutoTransfer(false));
    }

    private startObserveServiceBalance = async () => {

        const { ws, t, dispatch } = this.props;
        const { accountId } = this.state;

        const account = await ws.getAccount(accountId);

        if(account.ptcBalance !== 0 && account.ethBalance !== 0){
            this.setState({getPrix: true});
        }

        if(account.pscBalance !== this.state.accountPSCBalance ){
            this.setState({done: true});
            dispatch(handlers.addNotice({code: 1, notice: {level: 'info', msg: t('transferTokens:TransferPRIXCompletedSuccessfully')}}));
            this.observerId = null;
        }else{
            this.observerId = setTimeout(this.startObserveServiceBalance, 3000);
        }
    }

    private back = back(`/backup/${this.props.accountId}/generateKey`).bind(this);

    private onSubmit = (evt: any) => {

        evt.preventDefault();
        this.setState({didIt: true});
        this.startObserveServiceBalance();
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

        const { t, isModal } = this.props;
        const { ethAddr, didIt, getPrix, done, err } = this.state;
        const advancedMode = !this.isSimpleMode();
        const panelHeading = isModal
            ? ''
            : <div className='panel-heading'>
                <h4 className='text-center'>PRIX</h4>
            </div>;
        const steps = isModal
            ? ''
            : <Steps step={advancedMode ? 6 : 4} prix={true} shape={advancedMode ? 'advanced' : 'simple' } />;
        const bottomButtons = isModal
            ? ''
            : <div className='form-group text-right m-t-40'>
                {advancedMode ? <PreviousButton onSubmit={this.back} /> : null }
                {done
                    ? <FinishButton onSubmit={this.onFinish} />
                    : <button className='btn btn-default text-uppercase waves-effect waves-light pull-right m-l-5 btnCustomDisabled disabled' >
                        {t('auth/utils:Finish')}
                    </button>
                }
            </div>;

        return <div className='card-box'>
            {panelHeading}
            <div className={'form-horizontal ' + (isModal ? '' : 'm-t-20')}>
                <div className={(isModal ? '' : 'p-20 ') + 'wizard clearfix'}>
                    {steps}
                    <div className='content clearfix'>
                        <section>
                            <HintComponent msg={<i>{t('intro')}&nbsp;
                                <ExternalLink href='https://help.privatix.network/general/short-explanation-of-core-simple-ui-client'>
                                    {t('learnMore')}
                                </ExternalLink>.
                            </i>} />

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
                                                    <span style={ {padding: '0'} }
                                                          className='input-group-addon bootstrap-touchspin-postfix'>
                                                        <CopyToClipboard text={ethAddr}  className='inputCopyBtn' />
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
                            <div className='text-center'>
                                {didIt && (!getPrix || !done ) && !err
                                    ? <>
                                      {getPrix
                                          ? <>
                                              <div>{t('TokensHaveBeenReceived')}</div>
                                              <div>{t('WeAreTransferring')}</div>
                                            </>
                                          : t('PleaseWait')
                                      }
                                      <Spinner />
                                      </>
                                    : (done ? t('Congrats') : (err ? t('notEnoughETH') : null))
                                }
                            </div>
                            <h4 className='text-center'>
                                {done ? (isModal ? t('AllDoneCloseModal') : t('AllDonePressFinish')) : null }
                            </h4>
                            {bottomButtons}
                        </section>

                    </div>
                </div>
            </div>
        </div>;
    }
}

export default connect((state:State, ownProps: IProps) => Object.assign({}, {ws: state.ws, notices: state.notices}, ownProps))(withRouter(GetPrix));
