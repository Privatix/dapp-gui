import * as React from 'react';
import Transactions from '../transactions/transactionsList';

import ConfirmPopupSwal from '../confirmPopupSwal';
import ExternalLink from '../utils/externalLink';
import GasRange from '../utils/gasRange';

export default function(props:any){

    const changeTransferType = (evt) => {
        evt.preventDefault();
        let prixValue = evt.target[evt.target.selectedIndex].value;
        let transferToOld = evt.target[evt.target.selectedIndex].textContent;
        let transferTo = 'Exchange balance';

        if (transferToOld === 'Exchange balance') {
            transferTo = 'Service balance';
        }

        document.getElementById('accountBalance').innerHTML = prixValue;
        (document.getElementById('transferToInput') as HTMLInputElement).value = transferTo;
    };

    return <div className='col-lg-9 col-md-8'>
        <div className='card m-b-20'>
            <h5 className='card-header'>General Info</h5>
            <div className='card-body'>
                <div className='form-group row'>
                    <label className='col-3 col-form-label'>Name:</label>
                    <div className='col-9'>
                        <input type='text' className='form-control' value={props.account.name} readOnly/>
                    </div>
                </div>
                <div className='form-group row'>
                    <label className='col-3 col-form-label'>Address:</label>
                    <div className='col-9'>
                        <input type='text' className='form-control' value={`0x${Buffer.from(props.account.ethAddr, 'base64').toString('hex')}`} readOnly/>
                    </div>
                </div>
            </div>
        </div>
        <div className='card m-b-20'>
            <h5 className='card-header'>Balance Info</h5>
            <div className='card-body'>
                <div className='form-group row'>
                    <label className='col-3 col-form-label'>Exchange balance:</label>
                    <div className='col-9'>
                        <div className='input-group bootstrap-touchspin'>
                            <input type='text' className='form-control' value={props.account.ptcBalance} readOnly/>
                            <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                        </div>
                    </div>
                </div>
                <div className='form-group row'>
                    <label className='col-3 col-form-label'>Service balance:</label>
                    <div className='col-9'>
                        <div className='input-group bootstrap-touchspin'>
                            <input type='text' className='form-control' value={props.account.psc_balance} readOnly/>
                            <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className='card m-b-20'>
            <h5 className='card-header'>Transfer</h5>
            <div className='card-body'>
                <div className='form-group row'>
                    <label className='col-3 col-form-label'>From:</label>
                    <div className='col-9'>
                        <div className='row'>
                            <div className='col-8'>
                                <select className='form-control' id='selectProduct' onChange={changeTransferType}>
                                    <option key={props.account.ptcBalance} value={props.account.ptcBalance}>Exchange balance</option>
                                    <option key={props.account.psc_balance} value={props.account.psc_balance}>Service balance</option>
                                </select>
                            </div>
                            <div className='col-4 col-form-label'>
                                <span id='accountBalance'>{props.account.ptcBalance}</span> PRIX
                            </div>
                        </div>
                    </div>
                </div>
                <div className='form-group row'>
                    <label className='col-3 col-form-label'>To:</label>
                    <div className='col-9'>
                        <input type='text' className='form-control' id='transferToInput' value='Service balance' readOnly/>
                    </div>
                </div>
                <div className='form-group row'>
                    <label className='col-3 col-form-label'>Amount:</label>
                    <div className='col-9'>
                        <div className='input-group bootstrap-touchspin'>
                            <input type='text' className='form-control'/>
                            <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                        </div>
                    </div>
                </div>
                <div className='form-group row'>
                    <label className='col-3 col-form-label'>Gas price</label>
                    <div className='col-9'>
                        <div className='row'>
                            <div className='col-md-8'>
                                <GasRange />
                            </div>
                            <div className='col-4 col-form-label'>
                                <span id='gasPrice'>20</span> Gwei
                            </div>
                        </div>
                    </div>
                </div>
                <div className='form-group row'>
                    <div className='col-12 col-form-label'>
                        <strong>Average publication time: <span id='averagePublicationTime'>2 min</span></strong>
                    </div>
                    <div className='col-12 col-form-label'>
                        <strong>More information: <ExternalLink href='https://ethgasstation.info/' text='https://ethgasstation.info/' /></strong>
                    </div>
                </div>
                <div className='form-group row'>
                    <div className='col-12'>
                        <ConfirmPopupSwal
                            endpoint={'#'}
                            options={{method: 'put', body: {action: 'transfer'}}}
                            title={'Transfer'}
                            text={<span>This action will transfer your tokens from Service balance to Exchange balance.<br />
                                This operation takes time and gas.<br /><br />You can monitor transaction status in the Transaction log.</span>}
                            class={'btn btn-default btn-block btn-custom waves-effect waves-light'}
                            swalType='warning'
                            swalConfirmBtnText='Yes, transfer!'
                            swalTitle='Are you sure?' />
                    </div>
                </div>
            </div>
        </div>
        <div className='card m-t-30'>
            <h5 className='card-header'>Transaction Log</h5>
            <div className='card-body'>
                <Transactions account={props.account.id} />
            </div>
        </div>
    </div>;
}
