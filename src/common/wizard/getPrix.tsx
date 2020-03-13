import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Trans, withTranslation, WithTranslation} from 'react-i18next';

import {asyncProviders, default as handlers} from 'redux/actions';

import ExternalLink from 'common/etc/externalLink';
import CopyToClipboard from 'common/copyToClipboard';
import HintComponent from 'common/hintComponent';

import Steps from './steps';
import {back, FinishButton, PreviousButton} from './utils';
import Spinner from './spinner';

import {State} from 'typings/state';
import {Mode, Role} from 'typings/mode';
import drawQrCode from 'utils/qrCode';

interface IProps extends WithTranslation {
    ws?: State['ws'];
    dispatch?: any;
    history?: any;
    accountId: string;
    entryPoint: string;
    mode?: State['mode'];
    role?: State['role'];
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

const translate = withTranslation(['auth/getPrix', 'auth/generateKey', 'auth/utils', 'transferTokens']);

class GetPrix extends React.Component<IProps, IState> {

    static getDerivedStateFromProps(props: IProps) {
        return {err: props.notices.findIndex(notice => notice.code === 0) !== -1};
    }

    private observerId = null;

    constructor(props: IProps) {
        super(props);

        this.state = {
            ethAddr: '',
            didIt: false,
            getPrix: false,
            done: false,
            err: false,
            accountId: props.accountId,
            accountPSCBalance: 0
        };
    }

    isSimpleMode() {
        const {mode, role} = this.props;
        return mode === 'simple' || (mode === 'wizard' && role === Role.CLIENT);
    }

    async componentDidMount() {
        const {ws, accountId, dispatch, isModal} = this.props;

        const account = await ws.getAccount(accountId);
        this.setState({ethAddr: `0x${account.ethAddr}`, accountPSCBalance: account.pscBalance});
        drawQrCode(`0x${account.ethAddr}`);
        if (!isModal) {
            dispatch(handlers.setAutoTransfer(true));
        }
    }

    componentWillUnmount() {

        const {dispatch, isModal} = this.props;

        if (this.observerId) {
            clearTimeout(this.observerId);
        }
        if (!isModal) {
            dispatch(handlers.setAutoTransfer(false));
        }
    }

    private startObserveServiceBalance = async () => {

        const {ws, t, dispatch} = this.props;
        const {accountId} = this.state;

        const account = await ws.getAccount(accountId);

        if (account.ptcBalance !== 0 && account.ethBalance !== 0) {
            this.setState({getPrix: true});
        }

        if (account.pscBalance !== 0) {
            this.setState({done: true, getPrix: true});
            dispatch(handlers.addNotice({
                code: 1,
                notice: {level: 'info', msg: t('transferTokens:TransferPRIXCompletedSuccessfully')}
            }));
            this.observerId = null;
        } else {
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

        const {entryPoint, dispatch} = this.props;
        evt.preventDefault();
        if (this.isSimpleMode()) {
            dispatch(asyncProviders.setMode(Mode.SIMPLE));
        } else {
            dispatch(asyncProviders.setMode(Mode.ADVANCED));
        }
        this.props.history.push(entryPoint);

    }

    render() {

        const {t, isModal} = this.props;
        const {ethAddr, didIt, getPrix, done, err} = this.state;
        const advancedMode = !this.isSimpleMode();
        const panelHeading = isModal
            ? ''
            : <div className='panel-heading'>
                <h4 className='text-center'>PRIX</h4>
            </div>;
        const steps = isModal
            ? ''
            : <Steps step={advancedMode ? 6 : 4} prix={true} shape={advancedMode ? 'advanced' : 'simple'}/>;
        const bottomButtons = isModal
            ? ''
            : <div className='form-group text-right m-t-40'>
                {advancedMode ? <PreviousButton onSubmit={this.back}/> : null}
                {done
                    ? <FinishButton onSubmit={this.onFinish}/>
                    : <button
                        className='btn btn-default text-uppercase waves-effect waves-light pull-right m-l-5 btnCustomDisabled disabled'>
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
                                <ExternalLink
                                    href='https://docs.privatix.network/knowledge-base/simple-and-advanced-client'>
                                    {t('learnMore')}
                                </ExternalLink>.
                            </i>}/>

                            <h4>{t('fundYourAccount')}</h4>

                            <hr/>

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
                                                        We recommend transferring min 0.005 ETH and min 1 PRIX. Learn
                                                        about price formation&nbsp;
                                                        <ExternalLink
                                                            href='https://docs.privatix.network/knowledge-base/traffic-prices-formation'>here</ExternalLink>
                                                    </Trans>
                                                </li>
                                                <li>
                                                    <Trans i18nKey='thisOptionIsGood'>
                                                        This option is good for users who already have PRIX and ETH. If
                                                        you didn't,&nbsp;
                                                        <ExternalLink
                                                            href='https://docs.privatix.network/knowledge-base/how-to-get-prix'>
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
                                                <span style={{padding: '0'}}
                                                      className='input-group-addon bootstrap-touchspin-postfix'>
                                                        <CopyToClipboard text={ethAddr} className='inputCopyBtn'/>
                                                    </span>
                                            </div>
                                        </td>
                                        <td align='right' style={{verticalAlign: 'bottom', width: '40%'}}>
                                            <canvas id='qrCode'></canvas>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>

                            <hr/>

                            <p>{t('PressButton')}</p>
                            <div className='form-group row'>
                                <div className='col-md-12'>
                                    {didIt
                                        ? <button
                                            className='btn btnCustomDisabled btn-block disabled'>{t('IdidIt')}</button>
                                        : <button type='submit'
                                                  onClick={this.onSubmit}
                                                  className='btn btn-default btn-lg btn-custom btn-block waves-effect waves-light'
                                        >
                                            {t('IdidIt')}
                                        </button>
                                    }
                                </div>
                            </div>
                            <div className='text-center'>
                                {didIt && (!getPrix || !done) && !err
                                    ? <>
                                        {getPrix
                                            ? <>
                                                <div>{t('TokensHaveBeenReceived')}</div>
                                                <div>{t('WeAreTransferring')}</div>
                                            </>
                                            : t('PleaseWait')
                                        }
                                        <Spinner/>
                                    </>
                                    : (done ? t('Congrats') : (err ? t('notEnoughETH') : null))
                                }
                            </div>
                            <h4 className='text-center'>
                                {done ? (isModal ? t('AllDoneCloseModal') : t('AllDonePressFinish')) : null}
                            </h4>
                            {bottomButtons}
                        </section>

                    </div>
                </div>
            </div>
        </div>;
    }
}

export default connect((state: State, ownProps: any) => Object.assign({}
    , {
        mode: state.mode
        , role: state.role
        , ws: state.ws
        , notices: state.notices
    }
    , ownProps
))(withRouter(translate(GetPrix)));
