import * as React from 'react';
import Steps from './steps';
import { withRouter } from 'react-router-dom';
import {fetch} from '../../utils/fetch';
import { remote } from 'electron';


function saveDialog(e: any){
  e.preventDefault();
  
  let fileName=remote.dialog.showSaveDialog({});
  (document.getElementById('fileName') as HTMLInputElement).value = fileName;
}


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
            const fileName = (document.getElementById('fileName') as HTMLInputElement).value;
            evt.preventDefault();
            fetch('/backup', {body: {pk: props.privateKey, fileName}});
            history.push(props.entryPoint);
          }
        }
      >
        Next
      </button>
    );

    return <div className='card-box'>
        <div className='panel-heading'>
            <h4 className='text-center'> Backup Set the contract account of <strong className='text-custom'>Privatix</strong> </h4>
        </div>
        <form className='form-horizontal m-t-20'>
            <div className='p-20 wizard clearfix'>
                <Steps step='4' />
                <div className='content clearfix'>
                    <section>
                        <p>To prevent Ethereum address data lost you need to backup your Private Key in a safe location os a file.</p>
                        <p>Note: We encrypt this file using your application access password. Don't forget it!</p>
                       
                       <div className='form-group row'>
                        <div className='col-12'>
                            <label>Path to JSON Keystore File:</label>
                            <div className='row'>
                              <div className='col-10'><input type='text' className='form-control' id='fileName'/></div>
                              <div className='col-2'><button onClick={saveDialog} className='btn btn-white waves-effect'>Browse</button></div>
                            </div>
                          </div>
                       </div>
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
