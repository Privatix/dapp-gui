import * as React from 'react';
import Steps from './steps';
import { withRouter } from 'react-router-dom';
// import {fetch} from 'utils/fetch';


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
        /*const privateKey = createPrivateKey();
        const body = {privateKey
                     ,isDefault: true
                     ,inUse: true
                     ,name: 'default'
        };
        const res = await fetch('/accounts', {method: 'post', body});
        console.log(res);*/
        history.push('/backup');
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
                            <div className='col-8'><input type='text' name='name' className='form-control' /></div>
                       </div>
                       <div className='form-group row'>
                        <div className='col-12'>
                            <label>Path to JSON Keystore File:</label>
                            <input type='file' className='form-control' />
                          </div>
                       </div>
                       <div className='form-group row'>
                        <div className='col-12'>
                            <label>Password (will be used to decrypt JSON)</label>
                            <input type='password' className='form-control' />
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
