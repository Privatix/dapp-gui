import * as React from 'react';
import Steps from './steps';
import { withRouter } from 'react-router-dom';
import {fetch} from 'Utils/fetch';


// const createPrivateKey = function(){
//     return '5318b4d5bcd28de64ee5559e671353e16f075ecae9f99c7a79a38af5f869aa46';
// };

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
        const privateKey = (document.getElementById('importHexKey') as any).value;
        const name = (document.getElementById('importHexKeyName') as any).value;
        const body = {privateKey
                     ,isDefault: true
                     ,inUse: true
                     ,name
                     ,type: 'import_hex'
        };
        const res = await fetch('/accounts/', {method: 'post', body});
        console.log(res);
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
                            <div className='col-8'><input id='importHexKeyName' type='text' name='name' className='form-control' /></div>
                       </div>
                       <p>Please, input hex representation of your Private Key for address, that holds PRIX</p>
                       <div className='form-group row'>
                        <div className='col-12'>
                            <label>Private key:</label>
                            <textarea id='importHexKey' className='form-control'></textarea>
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
