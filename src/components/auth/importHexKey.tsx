import * as React from 'react';
import Steps from './steps';
import { withRouter } from 'react-router-dom';
import {fetch} from '../../utils/fetch';
import {PreviousButton, createPrivateKey} from './utils';
import notice from '../../utils/notice';

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

        let {privateKey, name} = this.state;
        let msg = '';
        let err = false;

        if(privateKey.substr(0,2) === '0x'){
            privateKey = privateKey.substr(2);
        }
        if(!/^[0-9a-z]{64}$/i.test(privateKey)){
            msg += ' Private key must have exactly 64 hex symbols.';
            err = true;
        }
        if(name === ''){
            msg += ' Accounts name can\'t be empty.';
            err = true;
        }

        if(err){
            notice({level: 'error', header: 'Attention!', msg});
            return;
        }

        const pk = new Buffer(privateKey, 'hex');
        const key = pk.toString('base64').split('+').join('-').split('/').join('_');
        const body = {privateKey: key
                     ,isDefault: this.props.match.params.default === 'true'
                     ,inUse: true
                     ,name
                     ,type: 'generate_new'
        };
        const res = await fetch('/accounts/', {method: 'post', body});
        const dk = createPrivateKey();
        console.log(res, dk);
        const newKeyObject = Object.assign({}, dk, {privateKey: pk});
        this.props.history.push(`/backup/${JSON.stringify(newKeyObject)}/importHexKey`);
    }

    render(){

        const GenerateNewAccButton = () => <button
            className='btn btn-default text-uppercase waves-effect waves-light m-l-5'
            type='button'
            onClick={this.onSubmit.bind(this)}
          >
            Next
          </button>;

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
                                    <input data-payload-value='name' type='text' name='name' className='form-control' onChange={this.onUserInput.bind(this)} />
                                </div>
                           </div>
                           <p>Please, input hex representation of your Private Key for address, that holds PRIX</p>
                           <div className='form-group row'>
                            <div className='col-12'>
                                <label>Private key:</label>
                                <textarea data-payload-value='privateKey' className='form-control' onChange={this.onUserInput.bind(this)} ></textarea>
                              </div>
                           </div>
                           <a href='https://en.wikipedia.org/wiki/Ethereum' target='_blank'>More information about Ethereum Private Key</a>
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

export default withRouter(ImportHexKey);
