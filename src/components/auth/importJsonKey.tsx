import * as React from 'react';
import Steps from './steps';
import { withRouter } from 'react-router-dom';
import {fetch} from '../../utils/fetch';
import * as keythereum from 'keythereum';
import {PreviousButton, createPrivateKey} from './utils';

export default function(props: any){

    const GenerateNewAccButton = withRouter(({ history }) => <button
        className='btn btn-default text-uppercase waves-effect waves-light m-l-5'
        type='button'
        onClick={async (evt: any) => {
            evt.preventDefault();

            const pwd = (document.getElementById('JsonKeyPwd') as any).value;
            const fileName = (document.getElementById('JsonKeyFile') as any).files[0].path;
            const name = (document.getElementById('JsonKeyAccName') as any).value;
            const res = await fetch('/readFile', {method: 'post', body: {fileName}});
            const keyObject = JSON.parse((res as any).file);
            console.log(pwd, fileName, res, keyObject);
            const pk = keythereum.recover(pwd, keyObject);
            const key = pk.toString('base64').split('+').join('-').split('/').join('_');
            console.log(pk, key);

            const body = {privateKey: key
                         ,isDefault: props.match.params.default === 'true'
                         ,inUse: true
                         ,name
                         ,type: 'generate_new'
            };
            console.log(body);
            await fetch('/accounts/', {method: 'post', body});
            const dk = createPrivateKey();
            const newKeyObject = Object.assign({}, dk, {privateKey: pk});
            history.push(`/backup/${JSON.stringify(newKeyObject)}`);
          }
        }
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
                            <div className='col-8'><input id='JsonKeyAccName' type='text' name='name' className='form-control' /></div>
                       </div>
                       <div className='form-group row'>
                        <div className='col-12'>
                            <label>Path to JSON Keystore File:</label>
                            <input id='JsonKeyFile' type='file' className='form-control' />
                          </div>
                       </div>
                       <div className='form-group row'>
                        <div className='col-12'>
                            <label>Password (will be used to decrypt JSON)</label>
                            <input id='JsonKeyPwd' type='password' className='form-control' />
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
