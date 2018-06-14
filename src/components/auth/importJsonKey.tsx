import * as React from 'react';
import Steps from './steps';
import { withRouter } from 'react-router-dom';
import {fetch} from '../../utils/fetch';
import * as keythereum from 'keythereum';
import {PreviousButton, createPrivateKey} from './utils';
import notice from '../../utils/notice';

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

        const {pwd, fileName, name} = this.state;
        let msg = '';
        let err = false;

        if(name === ''){
            msg += ' Account\'s name can\'t be empty.';
            err = true;
        }
        if(fileName === ''){
            msg += ' No file chosen.';
            err = true;
        }
        if(pwd === ''){
            msg += ' Please set the password.';
            err = true;
        }

        if(err){
            notice({level: 'error', header: 'attention!', msg});
            return;
        }

        const res = await fetch('/readFile', {method: 'post', body: {fileName}});
        const keyObject = JSON.parse((res as any).file);
        console.log(pwd, fileName, res, keyObject);
        const pk = keythereum.recover(pwd, keyObject);
        const key = pk.toString('base64').split('+').join('-').split('/').join('_');
        console.log(pk, key);

        const body = {privateKey: key
                     ,isDefault: this.props.match.params.default === 'true'
                     ,inUse: true
                     ,name
                     ,type: 'generate_new'
        };
        console.log(body);
        await fetch('/accounts/', {method: 'post', body});
        const dk = createPrivateKey();
        const newKeyObject = Object.assign({}, dk, {privateKey: pk});
        this.props.history.push(`/backup/${JSON.stringify(newKeyObject)}/importJsonKey`);
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
                                    <input data-payload-value='name' type='text' name='name' className='form-control' value={this.state.name}  onChange={this.onUserInput.bind(this)} />
                                </div>
                           </div>
                           <div className='form-group row'>
                            <div className='col-12'>
                                <label>Path to JSON Keystore File:</label>
                                <input type='file' className='form-control' onChange={this.onFileSelected.bind(this)} />
                              </div>
                           </div>
                           <div className='form-group row'>
                            <div className='col-12'>
                                <label>Password (will be used to decrypt JSON)</label>
                                <input data-payload-value='pwd' type='password' className='form-control' value={this.state.pwd}  onChange={this.onUserInput.bind(this)}/>
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

export default withRouter(ImportJsonKey);
