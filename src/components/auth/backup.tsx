import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import { remote } from 'electron';
import {fetch} from '../../utils/fetch';
import notice from '../../utils/notice';
import Steps from './steps';
import {NextButton} from './utils';

@translate(['auth/backup', 'auth/setAccount', 'auth/importJsonKey', 'utils/notice'])
class Backup extends React.Component<any, any>{

    constructor(props:any){
        super(props);
        this.state = {fileName: ''};
    }

    componentDidMount(){
        const { t } = this.props;
        notice({level: 'info', header: t('utils/notice:Congratulations!'), msg: t(this.props.from)});
    }

    saveDialog(e: any){
        e.preventDefault();
      
        let fileName=remote.dialog.showSaveDialog({});

        this.setState({fileName: 'string' === typeof fileName ? fileName : ''});
    }

    onSubmit = (evt: any) => {

        const { t } = this.props;

        evt.preventDefault();

        if(this.state.fileName === ''){
            notice({level: 'warning', header: t('utils/notice:Attention!'), msg: t('PleaseBackupYourAccount')});
            return;
        }

        fetch('/backup', {body: {pk: this.props.privateKey, fileName: this.state.fileName}})
            .then((res:any) => {
                if(res.err){
                    console.log(res);
                    notice({level: 'error', header: t('utils/notice:Error!'), msg: t('SomeErrorOccured')});
                }else{
                    this.props.history.push(this.props.entryPoint);
                }
            });
    }

    render(){

        const { t } = this.props;

        return <div className='card-box'>
            <div className='panel-heading'>
                <h4 className='text-center'> {t('auth/setAccount:SetTheContractAccount')} <strong className='text-custom'>Privatix</strong> </h4>
            </div>
            <form className='form-horizontal m-t-20'>
                <div className='p-20 wizard clearfix'>
                    <Steps step='4' />
                    <div className='content clearfix'>
                        <section>
                            <p>{t('ToPreventEthereumAddress')}</p>
                            <p>{t('NoteWeEncryptThisFile')}</p>
                            <div className='form-group row'>
                                <div className='col-12'>
                                    <label>{t('auth/importJsonKey:PathToJSONKeystoreFile')}:</label>
                                    <div className='row'>
                                      <div className='col-10'><input type='text' className='form-control' value={this.state.fileName} /></div>
                                      <div className='col-2'><button onClick={this.saveDialog.bind(this)} className='btn btn-white waves-effect'>{t('Browse')}</button></div>
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

export default withRouter(Backup);
