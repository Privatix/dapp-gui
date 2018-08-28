import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import * as keythereum from 'keythereum';

import Steps from './steps';
import {PreviousButton, NextButton, createPrivateKey} from './utils';
import {fetch} from '../../utils/fetch';
import notice from '../../utils/notice';
import * as api from '../../utils/api';

@translate(['auth/importJsonKey', 'auth/setAccount', 'auth/generateKey', 'utils/notice'])
class ImportJsonKey extends React.Component<any, any>{

    constructor(props: any){
        super(props);
        this.state = {name: '', fileName: '', pwd: ''};
    }

    onUserInput(evt: any){

        this.setState({[evt.target.dataset.payloadValue]: evt.target.value.trim()});
    }

    onFileSelected(evt: any){
        const fileName = evt.target.files[0].path;
        this.setState({fileName});
    }

    async onSubmit(evt: any){
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

        const res = await fetch('/readFile', {method: 'post', body: {fileName}});
        const keyObject = JSON.parse((res as any).file);
        console.log(pwd, fileName, res, keyObject);
        let pk;
        try {
            pk = keythereum.recover(pwd, keyObject);
        } catch (err) {
            msg = t('PleaseEnterAValidPassword');
            notice({level: 'error', header: t('utils/notice:Attention!'), msg});
            return;
        }
        const key = pk.toString('base64').split('+').join('-').split('/').join('_');
        console.log(pk, key);

        const saveRes = await api.accounts.createNewAccount(key, this.props.default === 'true', true, name, 'generate_new');
        console.log(saveRes);
        await api.settings.updateLocal({accountCreated:true});

        const dk = createPrivateKey();
        const newKeyObject = Object.assign({}, dk, {privateKey: pk});
        this.props.history.push(`/backup/${JSON.stringify(newKeyObject)}/importJsonKey`);
    }

    render(){

        const { t } = this.props;

        return <div className='card-box'>
            <div className='panel-heading'>
                <h4 className='text-center'> {t('auth/setAccount:SetTheContractAccount')} <strong className='text-custom'>Privatix</strong> </h4>
            </div>
            <form className='form-horizontal m-t-20'>
                <div className='p-20 wizard clearfix'>
                    <Steps step='3' />
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
                                <PreviousButton />
                                <NextButton onSubmit={this.onSubmit.bind(this)} />
                            </div>
                        </section>
                    </div>
                </div>
            </form>
        </div>;
    }
}

export default withRouter(ImportJsonKey);
