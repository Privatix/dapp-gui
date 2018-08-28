import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';

import Steps from './steps';
import {PreviousButton, NextButton, createPrivateKey} from './utils';
import notice from '../../utils/notice';
import * as api from '../../utils/api';

@translate(['auth/importHexKey', 'auth/setAccount', 'auth/generateKey', 'auth/importJsonKey', 'utils/notice'])
class ImportHexKey extends React.Component<any, any>{

    constructor(props: any){
        super(props);
        this.state = {privateKey: '', name: ''};
    }

    onUserInput(evt: any){

        this.setState({[evt.target.dataset.payloadValue]: evt.target.value.trim()});
    }

    async onSubmit(evt: any){

        evt.preventDefault();

        const { t } = this.props;
        let {privateKey, name} = this.state;
        let msg = '';
        let err = false;

        if(privateKey.substr(0,2) === '0x'){
            privateKey = privateKey.substr(2);
        }
        if(!/^[0-9a-z]{64}$/i.test(privateKey)){
            msg += ' ' + t('PrivateKeyMustHave');
            err = true;
        }
        if(name === ''){
            msg += ' ' + t('auth/generateKey:AccountsNameCantBeEmpty');
            err = true;
        }

        if(err){
            notice({level: 'error', header: t('utils/notice:Attention!'), msg});
            return;
        }

        const pk = new Buffer(privateKey, 'hex');
        const key = pk.toString('base64').split('+').join('-').split('/').join('_');

        const res = await api.accounts.createNewAccount(key, this.props.default === 'true', true, name, 'generate_new');
        console.log(res);
        await api.settings.updateLocal({accountCreated:true});

        const dk = createPrivateKey();
        console.log(res, dk);
        const newKeyObject = Object.assign({}, dk, {privateKey: pk});
        this.props.history.push(`/backup/${JSON.stringify(newKeyObject)}/importHexKey`);
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
                                           onChange={this.onUserInput.bind(this)}
                                    />
                                </div>
                           </div>
                           <p>{t('PleaseInputHexRepresentation')}</p>
                           <div className='form-group row'>
                            <div className='col-12'>
                                <label>{t('PrivateKey')}:</label>
                                <textarea data-payload-value='privateKey' className='form-control' onChange={this.onUserInput.bind(this)} ></textarea>
                              </div>
                           </div>
                           <a href='https://en.wikipedia.org/wiki/Ethereum' target='_blank'>{t('auth/importJsonKey:MoreInformation')}</a>
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

export default withRouter(ImportHexKey);
