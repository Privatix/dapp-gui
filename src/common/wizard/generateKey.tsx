import React from 'react';
import { withRouter } from 'react-router-dom';
import { WithTranslation, withTranslation } from 'react-i18next';

import Steps from './steps';
import {PreviousButton, NextButton, back} from './utils';
import notice from 'utils/notice';

import { WS, ws } from 'utils/ws';

interface IProps extends WithTranslation{
    ws?: WS;
    history?: any;
    isDefault: boolean;
}

interface IState {
    name: string;
}

const translate = withTranslation(['auth/generateKey', 'auth/setAccount', 'utils/notice']);

class GenerateKey extends React.Component<IProps, IState>{

    constructor(props: IProps){
        super(props);
        this.state = {name: props.isDefault ? 'main' : ''};
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

    onUserInput = (evt:any) => {
        this.setState({name: String(evt.target.value).trim()});
    }

    onSubmit = async (evt: any) => {
        evt.preventDefault();

        const { t, ws, isDefault } = this.props;
        const { name } = this.state;

        let msg = '';
        let err = false;

        if(name === ''){
            msg += ' ' + t('AccountsNameCantBeEmpty');
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
        };

        try {
            const accountId = await ws.generateAccount(payload);
            await ws.setGUISettings({accountCreated:true});
            this.props.history.push(`/backup/${accountId}/generateKey`);
        } catch (e){
            msg = t('SomethingWentWrong');
            notice({level: 'error', header: t('utils/notice:Attention!'), msg});
        }
    }

    render(){

        const { t } = this.props;
        const { name } = this.state;

        return <div className='card-box'>
            <div className='panel-heading'>
                <h4 className='text-center'> {t('auth/setAccount:SetTheContractAccount')} <strong className='text-custom'>Privatix</strong> </h4>
            </div>
            <form className='form-horizontal m-t-20'>
                <div className='p-20 wizard clearfix'>
                    <Steps step={4} prix={true} shape='advanced' />
                    <div className='content clearfix'>
                        <section>
                           <div className='form-group row'>
                                <label className='col-2 col-form-label'>{t('Name')}:</label>
                                <div className='col-8'>
                                    <input data-payload-value='name'
                                           type='text'
                                           name='name'
                                           className='form-control'
                                           onChange={this.onUserInput}
                                           value={name}
                                    />
                                </div>
                           </div>
                           <p>{t('WhileNextButton')}</p>
                           <p>{t('IfYouLoseThePassword')}</p>
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

export default ws<IProps>(withRouter(translate(GenerateKey)));
