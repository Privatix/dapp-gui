import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import { remote } from 'electron';

import * as api from 'utils/api';
import { WS, ws } from 'utils/ws';

import notice from 'utils/notice';
import Steps from './steps';
import {NextButton} from './utils';

type From = 'generateKey' | 'importHexKey' | 'importJsonKey' | 'simpleMode';

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
    accountId: string;
}

@translate(['auth/backup', 'auth/importJsonKey', 'utils/notice'])
class Backup extends React.Component<IProps, IState>{

    constructor(props:IProps){
        super(props);
        this.state = {fileName: '', accountId: props.accountId};
    }

    async componentDidMount(){

        const { t, from , ws } = this.props;

        document.addEventListener('keydown', this.handleKeyDown);

        if(from === 'simpleMode'){
            // simple mode!
            const payload = {
                isDefault: true
               ,inUse: true
               ,name: 'main'
            };

            try {
                const accountId = await ws.generateAccount(payload);
                await ws.setGUISettings({accountCreated:true});
                this.setState({accountId});
            } catch (e){
                const msg = t('auth/generateKey:SomethingWentWrong');
                notice({level: 'error', header: t('utils/notice:Attention!'), msg});
            }
        }else{
            notice({level: 'info', header: t('utils/notice:Congratulations!'), msg: t(from)});
        }
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

    onSubmit = async (evt: any) => {

        const { t, ws, history, entryPoint, from } = this.props;
        const { fileName, accountId } = this.state;

        evt.preventDefault();

        if(fileName === ''){
            notice({level: 'warning', header: t('utils/notice:Attention!'), msg: t('PleaseBackupYourAccount')});
            return;
        }

        try{
            const acc = await ws.exportAccount(accountId);
            const response = await api.fs.saveAs(fileName, atob(acc));
            if(response.err){
                throw new Error();
            }
            history.push(['generateKey', 'simpleMode'].includes(from) ? `/getPrix/${accountId}/simple` : entryPoint);
        }catch(e){
            notice({level: 'error', header: t('utils/notice:Error!'), msg: t('SomeErrorOccured')});
        }
    }

    render(){

        const { t, from } = this.props;
        const { fileName } = this.state;

        const step = from === 'simpleMode' ? 3 : 5;
        const shape = from === 'simpleMode' ? 'simple' : 'advanced';

        return <div className='card-box'>
            <div className='panel-heading'>
                <h4 className='text-center'>{t('Backup')}</h4>
            </div>
            <form className='form-horizontal m-t-20'>
                <div className='p-20 wizard clearfix'>
                    <Steps step={step} prix={from === 'generateKey'} shape={shape} />
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
