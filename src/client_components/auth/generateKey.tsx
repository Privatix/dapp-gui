import * as React from 'react';
import Steps from './steps';
import { withRouter } from 'react-router-dom';
import {fetch} from '../../utils/fetch';
import * as keythereum from 'keythereum';

const createPrivateKey = function(){
    const params = { keyBytes: 32, ivBytes: 16 };
    const dk = keythereum.create(params);
    return dk;
};

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




export default function(props: any){

    const GenerateNewAccButton = withRouter(({ history }) => <button
        className='btn btn-default text-uppercase waves-effect waves-light m-l-5'
        type='button'
        onClick={async (evt: any) => {
            evt.preventDefault();
            const name = (document.getElementById('generateKeyAccountName') as any).value;
            const privateKey = createPrivateKey();
            const key = privateKey.privateKey.toString('base64').split('+').join('-').split('/').join('_');
            const body = {privateKey: key
                         ,isDefault: props.match.params.default === 'true'
                         ,inUse: true
                         ,name
                         ,type: 'generate_new'
            };
            const res = await fetch('/accounts/', {method: 'post', body});
            console.log(res);
            history.push(`/backup/${JSON.stringify(privateKey)}`);
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
                            <div className='col-8'><input id='generateKeyAccountName' type='text' name='name' className='form-control' /></div>
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
