import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import { remote } from 'electron';

import * as api from 'utils/api';
import { WS, ws } from 'utils/ws';

import notice from 'utils/notice';
import Steps from './steps';
import {NextButton} from './utils';

type From = 'generateKey' | 'importHexKey' | 'importJsonKey';

interface IProps{
    ws?: WS;
    t?: any;
    history?: any;
    accountId: string;
    from: From;
    entryPoint: string;
}

interface IState {
    fileName: string;
}

@translate(['auth/backup', 'auth/setAccount', 'auth/importJsonKey', 'utils/notice'])
class Backup extends React.Component<IProps, IState>{

    constructor(props:IProps){
        super(props);
        this.state = {fileName: ''};
    }

    componentDidMount(){
        const { t } = this.props;
        document.addEventListener('keydown', this.handleKeyDown);
        notice({level: 'info', header: t('utils/notice:Congratulations!'), msg: t(this.props.from)});
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown = (evt: any) => {
        if (evt.keyCode === 13) {
            this.onSubmit(evt);
        }
    }

    saveDialog = (e: any) => {
        e.preventDefault();

        let fileName = remote.dialog.showSaveDialog({});

        this.setState({fileName: 'string' === typeof fileName ? fileName : ''});
    }

    onSubmit = (evt: any) => {

        const { t, ws, history, accountId, entryPoint, from } = this.props;
        const { fileName } = this.state;

        evt.preventDefault();

        if(fileName === ''){
            notice({level: 'warning', header: t('utils/notice:Attention!'), msg: t('PleaseBackupYourAccount')});
            return;
        }

        ws.exportAccount(accountId, (res: any) => {
            api.fs.saveAs(fileName, atob(res.result))
                .then((res:any) => {
                    if(res.err){
                        notice({level: 'error', header: t('utils/notice:Error!'), msg: t('SomeErrorOccured')});
                    }else{
                        history.push(from === 'generateKey' ? `/getPrix/${accountId}` : entryPoint);
                    }
                });
        });
    }

    render(){

        const { t, from } = this.props;
        const { fileName } = this.state;

        return <div className='card-box'>
            <div className='panel-heading'>
                <h4 className='text-center'> {t('auth/setAccount:SetTheContractAccount')} <strong className='text-custom'>Privatix</strong> </h4>
            </div>
            <form className='form-horizontal m-t-20'>
                <div className='p-20 wizard clearfix'>
                    <Steps step={5} prix={from === 'generateKey'} mode='advanced' />
                    <div className='content clearfix'>
                        <section>
                            <p>{t('ToPreventEthereumAddress')}</p>
                            <p>{t('NoteWeEncryptThisFile')}</p>
                            <div className='form-group row'>
                                <div className='col-12'>
                                    <label>{t('auth/importJsonKey:PathToJSONKeystoreFile')}:</label>
                                    <div className='row'>
                                      <div className='col-10'><input type='text' className='form-control' value={fileName} readOnly /></div>
                                      <div className='col-2'><button onClick={this.saveDialog} className='btn btn-white waves-effect'>{t('Browse')}</button></div>
                                    </div>
                               </div>
                           </div>
                           <div className='form-group text-right m-t-40'>
                                <NextButton onSubmit={this.onSubmit} />
                           </div>
                        </section>
                    </div>
                </div>
            </form>
        </div>;
    }
}

export default ws<IProps>(withRouter(Backup));
