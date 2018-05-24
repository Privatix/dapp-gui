import * as React from 'react';
import ConfirmPopupSwal from '../confirmPopupSwal';

export default function(props:any){

    return <div className='col-lg-3 col-md-4'>
        <div className='card m-b-20 card-body text-xs-center'>
            <form>
                <p className='card-text'>This action will set the current account as a default</p>
                <ConfirmPopupSwal
                    options={{method: 'put', body: {action: 'setDefault'}}}
                    title={'Set as default'}
                    text={<span>This action will set the current account as a <strong>default</strong>.</span>}
                    class={'btn btn-primary btn-custom btn-block'}
                    swalType='warning'
                    swalConfirmBtnText='Yes, set as default!'
                    swalTitle='Are you sure?' />
            </form>
        </div>
        <div className='card m-b-20 card-body text-xs-center warningAreaCard'>
            <form>
                <h5 className='card-title'>Warning Area</h5>
                <p className='card-text'>This action will permanently delete your account from the application. You can restore account only from backup.<br />
                    Be careful, you can lose your coins.</p>
                <ConfirmPopupSwal
                    options={{method: 'put', body: {action: 'remove'}}}
                    title={'Delete'}
                    text={<span>This action will permanently delete your account from the application.<br />
                        Be careful, you can lose your coins.<br /><br />
                        You can't undo this action.</span>}
                    class={'btn btn-danger btn-custom btn-block'}
                    swalType='danger'
                    swalConfirmBtnText='Yes, delete it!'
                    swalTitle='Are you sure?' />
            </form>
        </div>
    </div>;
}
