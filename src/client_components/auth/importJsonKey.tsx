import * as React from 'react';
import Steps from './steps';
import { withRouter } from 'react-router-dom';
import {fetch} from 'Utils/fetch';


const PreviousButton = withRouter(({ history }) => <button
    className='btn btn-secondary text-uppercase waves-effect waves-light'
    type='button'
    onClick={async (evt: any) => {
        evt.preventDefault();
        history.push('/setAccount');
      }
    }
  >
    Previous
  </button>
);

const GenerateNewAccButton = withRouter(({ history }) => <button
    className='btn btn-default text-uppercase waves-effect waves-light m-l-5'
    type='button'
    onClick={async (evt: any) => {
        evt.preventDefault();

        const pwd = (document.getElementById('JsonKeyPwd') as any).value;
        const fileName = (document.getElementById('JsonKeyFile') as any).files[0].path;
        const name = (document.getElementById('JsonKeyAccName') as any).value;
        const file = await fetch('/readFile', {method: 'post', body: {fileName}});
        console.log(pwd, fileName, file);
        const body = {jsonKeyStoreRaw: file
                     ,jsonKeyStorePassword: pwd
                     ,isDefault: true
                     ,inUse: true
                     ,name
                     ,type: 'import_json'
        };
        await fetch('/accounts', {method: 'post', body});
        history.push(`/login`);
      }
    }
  >
    Next
  </button>
);


export default function(props: any){
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
