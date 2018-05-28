import * as React from 'react';
// import fetch from 'node-fetch';
import Steps from './steps';
import { withRouter } from 'react-router-dom';

let keyType = 'generate';

const UseThisButton = withRouter(({ history }) => <button
    className='btn btn-default text-uppercase waves-effect waves-light m-l-5'
    type='button'
    onClick={async (evt: any) => {
        evt.preventDefault();
        switch(keyType){
            case 'generate':
                console.log('/generateKey');
                history.push('/generateKey');
            break;
            case 'importHex':
                history.push('/importHexKey');
            break;
            case 'importJson':
                history.push('/importJsonKey');
            break;
        }
        // console.log(document.getElementsByName('keyType')[0].value);
      }
    }
  >
    Next
  </button>
);

const PreviousButton = withRouter(({ history }) => <button
    className='btn btn-secondary text-uppercase waves-effect waves-light'
    type='button'
    onClick={async (evt: any) => {
        evt.preventDefault();
        history.push('/');
      }
    }
  >
    Previous
  </button>
);

function handleChange(e:any) {
    keyType = e.target.value;
    console.log(keyType);
}


export default function(props: any){
    return <div className='card-box'>
        <div className='panel-heading'>
            <h4 className='text-center'> Set the contract account of <strong className='text-custom'>Privatix</strong> </h4>
        </div>
        <form className='form-horizontal m-t-20'>
            <div className='p-20 wizard clearfix'>
                <Steps step='2' />
                <div className='content clearfix'>
                    <section>
                        <p>For token transfers, you need to add your Private Key for address, that holds PRIX</p>
                        <h5>We recommend you:</h5>
                        
                        <ul className='default'>
                            <li>create a separate account</li>
                            <li>transfer to them limited amount of PRIX and ETH</li>
                            <li>use this separate account in this application</li>
                        </ul>
                        <p>Please choose the way you want to import Ethereum account:</p>
                        <div className='row'>
                            <div className='col-12'>
                                <div className='custom-control custom-radio'>
                                    <input type='radio' name='keyType' id='keyType1' defaultChecked={true} className='custom-control-input' value='generate' onChange={handleChange}/>
                                    <label className='custom-control-label' htmlFor='keyType1'>Generate new (recommended)</label>
                                </div>
                                <div className='custom-control custom-radio'>
                                    <input type='radio' name='keyType' id='keyType2' className='custom-control-input' value='importHex' onChange={handleChange}/>
                                    <label className='custom-control-label' htmlFor='keyType2'>Import a Private Key in hex format</label>
                                </div>
                                <div className='custom-control custom-radio'>
                                    <input type='radio' name='keyType' id='keyType3' className='custom-control-input' value='importJson' onChange={handleChange}/>
                                    <label className='custom-control-label' htmlFor='keyType3'>Import from JSON Keystore File</label>
                                </div>
                            </div>
                        </div>
                        <div className='form-group text-right m-t-40'>
                                <PreviousButton />
                                <UseThisButton />
                        </div>
                            
                    </section>
                </div>
            </div>
        </form>
        
    </div>;
}
