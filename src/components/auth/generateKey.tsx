import * as React from 'react';
import Steps from './steps';
import { withRouter } from 'react-router-dom';
import {fetch} from '../../utils/fetch';
import {PreviousButton, createPrivateKey} from './utils';
import notice from '../../utils/notice';

class GenerateKey extends React.Component<any, any>{

    constructor(props: any){
        super(props);
        this.state = {name: ''};
    }

    onUserInput(evt:any){
        this.setState({[evt.target.dataset.payloadValue]: evt.target.value.trim()});
    }

    async onSubmit(evt: any){

        evt.preventDefault();

        const name = this.state.name;
        let msg = '';
        let err = false;

        if(name === ''){
            msg += ' Accounts name can\'t be empty.';
            err = true;
        }

        if(err){
            notice({level: 'error', header: 'Attention!', msg});
            return;
        }

        const dk = createPrivateKey();
        const key = dk.privateKey.toString('base64').split('+').join('-').split('/').join('_');
        const body = {privateKey: key
                     ,isDefault: this.props.match.params.default === 'true'
                     ,inUse: true
                     ,name
                     ,type: 'generate_new'
        };
        console.log('GENERATE!!!', body);
        const res = await fetch('/accounts/', {method: 'post', body});
        console.log(res);
        const settings = await fetch('/localSettings', {}) as any;
        settings.accountCreated = true;
        await fetch('/localSettings', {method: 'put', body: settings});
        this.props.history.push(`/backup/${JSON.stringify(dk)}/generateKey`);
    }

    render(){

        const GenerateNewAccButton = withRouter(({ history }) => <button
            className='btn btn-default text-uppercase waves-effect waves-light m-l-5'
            type='button'
            onClick={this.onSubmit.bind(this)}
          >
            Next
          </button>
        );

        return <div className='card-box'>
            <div className='panel-heading'>
                <h4 className='text-center'> Set the contract account of <strong className='text-custom'>Privatix</strong> </h4>
            </div>
            <form className='form-horizontal m-t-20'>
                <div className='p-20 wizard clearfix'>
                    <Steps step='3' />
                    <div className='content clearfix'>
                        <section>
                           <div className='form-group row'>
                                <label className='col-2 col-form-label'>Name:</label>
                                <div className='col-8'>
                                    <input data-payload-value='name' type='text' name='name' className='form-control' onChange={this.onUserInput.bind(this)} value={this.state.name}/>
                                </div>
                           </div>
                           <p>While next button will be pressed, we will generate a new account.</p>
                           <p>If you lose the password you use to encrypt your account, you will not be able to access that account</p>
                           <div className='form-group text-right m-t-40'>
                                <PreviousButton />
                                <GenerateNewAccButton />
                           </div>
                        </section>
                    </div>
                </div>
            </form>
        </div>;
    }
}

export default withRouter(GenerateKey);
