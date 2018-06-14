import * as React from 'react';
import Steps from './steps';
import { withRouter } from 'react-router-dom';
import {fetch} from '../../utils/fetch';
import { remote } from 'electron';
import notice from '../../utils/notice';

export default class Backup extends React.Component<any, any>{

    constructor(props:any){
        super(props);
        this.state = {fileName: ''};
    }

    componentDidMount(){
        const msg = {
            'generateKey': 'new key hase been succesfully generated and registered!'
           ,'importHexKey': 'hex key hase been succesfully imported and registered!'
           ,'importJsonKey': 'JSON Keystore File hase been succesfully imported!'
        };
        notice({level: 'info', header: 'Congratulations!', msg: msg[this.props.from]});
    }

    saveDialog(e: any){
      e.preventDefault();
      
      let fileName=remote.dialog.showSaveDialog({});
      this.setState({fileName});
    }

    render(){

        const GenerateNewAccButton = withRouter(({ history }) => <button
            className='btn btn-default text-uppercase waves-effect waves-light m-l-5'
            type='button'
            onClick={async (evt: any) => {
                evt.preventDefault();
                if(this.state.fileName === ''){
                    notice({level: 'warning', header: 'Attention!', msg: 'Please backup your account before start working.'});
                    return;
                }
                fetch('/backup', {body: {pk: this.props.privateKey, fileName: this.state.fileName}})
                    .then((res:any) => {
                        if(res.err){
                            console.log(res);
                            notice({level: 'error', header: 'Error!', msg: 'Some error occured. Can\'t save file by specified path.'});
                        }else{
                            history.push(this.props.entryPoint);
                        }
                    });
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
                                      <div className='col-10'><input type='text' className='form-control' value={this.state.fileName} /></div>
                                      <div className='col-2'><button onClick={this.saveDialog.bind(this)} className='btn btn-white waves-effect'>Browse</button></div>
                                    </div>
                               </div>
                           </div>
                           <div className='form-group text-right m-t-40'>
                                <GenerateNewAccButton />
                           </div>
                        </section>
                    </div>
                </div>
            </form>
        </div>;
    }
}
