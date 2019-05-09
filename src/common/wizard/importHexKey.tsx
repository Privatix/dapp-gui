import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';

import Steps from './steps';
import { PreviousButton, NextButton, back } from './utils';
import notice from 'utils/notice';

import { WS, ws } from 'utils/ws';

interface IProps {
    ws?: WS;
    t?: any;
    history?: any;
    isDefault: boolean;
}

interface IState {
    name: string;
    privateKey: string;
}

@translate(['auth/importHexKey', 'auth/setAccount', 'auth/generateKey', 'auth/importJsonKey', 'utils/notice'])
class ImportHexKey extends React.Component<IProps, IState>{

    constructor(props: IProps){
        super(props);
        this.state = {name: props.isDefault ? 'main' : ''
                     ,privateKey: ''
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

    onUserInput(field: keyof IState, evt: any){

        // https://github.com/Microsoft/TypeScript/issues/13948
        this.setState({[field]: String(evt.target.value).trim()} as Pick<IState, keyof IState>);
    }

    onNameChanged = this.onUserInput.bind(this, 'name');
    onPrivateKeyChanged = this.onUserInput.bind(this, 'privateKey');

    onSubmit = async (evt: any) => {

        evt.preventDefault();

        const { t, ws, isDefault } = this.props;
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

        const payload = {
             isDefault
            ,inUse: true
            ,name
            ,privateKeyHex: privateKey
        };

        try {
            const id = await ws.importAccountFromHex(payload);
            await ws.setGUISettings({accountCreated:true});
            this.props.history.push(`/backup/${id}/importHexKey`);
        } catch (e) {
            msg = t('SomethingWentWrong');
            notice({level: 'error', header: t('utils/notice:Attention!'), msg});
        }
    }

    render(){

        const { t } = this.props;

        return <div className='card-box'>
            <div className='panel-heading'>
                <h4 className='text-center'> {t('auth/setAccount:SetTheContractAccount')} <strong className='text-custom'>Privatix</strong> </h4>
            </div>
            <form className='form-horizontal m-t-20'>
                <div className='p-20 wizard clearfix'>
                    <Steps step={4} mode='advanced' />
                    <div className='content clearfix'>
                        <section>
                           <div className='form-group row'>
                                <label className='col-2 col-form-label'>{t('auth/generateKey:Name')}:</label>
                                <div className='col-8'>
                                    <input type='text'
                                           name='name'
                                           className='form-control'
                                           value={this.state.name}
                                           onChange={this.onNameChanged}
                                    />
                                </div>
                           </div>
                           <p>{t('PleaseInputHexRepresentation')}</p>
                           <div className='form-group row'>
                            <div className='col-12'>
                                <label>{t('PrivateKey')}:</label>
                                <textarea className='form-control' onChange={this.onPrivateKeyChanged} ></textarea>
                              </div>
                           </div>
                           <a href='https://en.wikipedia.org/wiki/Ethereum' target='_blank'>{t('auth/importJsonKey:MoreInformation')}</a>
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

export default ws<IProps>(withRouter(ImportHexKey));
