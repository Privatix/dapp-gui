import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';

import Steps from './steps';
import { PreviousButton, NextButton, back } from './utils';
import notice from 'utils/notice';
import * as api from 'utils/api';

@translate(['auth/importJsonKey', 'auth/setAccount', 'auth/generateKey', 'utils/notice'])
class ImportJsonKey extends React.Component<any, any>{

    constructor(props: any){
        super(props);
        this.state = {name: this.props.default === 'true' ? 'main' : ''
                     ,fileName: ''
                     ,pwd: ''
                     };
    }

    back = back('/setAccount').bind(this);

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown = (evt: any) => {
        if (evt.keyCode === 13) {
            this.onSubmit(evt);
        }
    }

    onUserInput(evt: any){

        this.setState({[evt.target.dataset.payloadValue]: evt.target.value.trim()});
    }

    onFileSelected(evt: any){
        const fileName = evt.target.files[0].path;
        this.setState({fileName});
    }

    onSubmit = async (evt: any) => {
        evt.preventDefault();

        const { t } = this.props;
        const {pwd, fileName, name} = this.state;
        let msg = '';
        let err = false;

        if(name === ''){
            msg += ' ' + t('auth/generateKey:AccountsNameCantBeEmpty');
            err = true;
        }
        if(fileName === ''){
            msg += ' ' + t('NoFileChosen');
            err = true;
        }
        if(pwd === ''){
            msg += ' ' + t('PleaseSetThePassword');
            err = true;
        }

        if(err){
            notice({level: 'error', header: t('utils/notice:Attention!'), msg});
            return;
        }

        const res = await api.fs.readFile(fileName);
        const keyObject = JSON.parse(res);

        const payload = {
             isDefault: this.props.default === 'true'
            ,inUse: true
            ,name
        };

        (window as any).ws.importAccountFromJSON(payload, keyObject, pwd, (res: any)=>{
            if('error' in res){
                msg = t('SomethingWentWrong');
                notice({level: 'error', header: t('utils/notice:Attention!'), msg});
            }else{
                api.settings.updateLocal({accountCreated:true});
                this.props.history.push(`/backup/${res.result}/importJsonKey`);
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
                           <div className='form-group row'>
                                <label className='col-2 col-form-label'>{t('auth/generateKey:Name')}:</label>
                                <div className='col-8'>
                                    <input data-payload-value='name'
                                           type='text'
                                           name='name'
                                           className='form-control'
                                           value={this.state.name}
                                           onChange={this.onUserInput.bind(this)}
                                    />
                                </div>
                           </div>
                           <div className='form-group row'>
                            <div className='col-12'>
                                <label>{t('PathToJSONKeystoreFile')}:</label>
                                <input type='file' className='form-control' onChange={this.onFileSelected.bind(this)} />
                              </div>
                           </div>
                           <div className='form-group row'>
                            <div className='col-12'>
                                <label>{t('PasswordWillBeUsed')}</label>
                                <input data-payload-value='pwd'
                                       type='password'
                                       className='form-control'
                                       value={this.state.pwd}
                                       onChange={this.onUserInput.bind(this)}
                                />
                              </div>
                           </div>
                           <a href='https://en.wikipedia.org/wiki/Ethereum' target='_blank'>{t('MoreInformation')}</a>
                           <div className='form-group text-right m-t-40'>
                                <PreviousButton onSubmit={this.back} />
                                <NextButton onSubmit={this.onSubmit} />
                            </div>
                        </section>
                    </div>
                </div>
            </form>
        </div>;
    }
}

export default withRouter(ImportJsonKey);
