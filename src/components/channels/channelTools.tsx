import * as React from 'react';
// import { Link } from 'react-router-dom';
// import ChannelToolClose from './channelToolClose';
import ConfirmPopupSwal from '../confirmPopupSwal';

export default function(props:any){

    return <div className='col-lg-3 col-md-4'>
        <div className='card m-b-20 card-body text-xs-center warningAreaCard'>
            <form>
                <h5 className='card-title'>Warning Area</h5>
                <p className='card-text'>This operation will terminate the service and call the "Uncooperative close" procedure</p>
                <ConfirmPopupSwal
                    endpoint={`/channels/${props.channelId}/status`}
                    options={{method: 'put', body: {action: 'terminate'}}}
                    title={'Terminate contract'}
                    text={<span>This operation will terminate the service and call the "Uncooperative close" procedure.<br />
                            You can't undo this.</span>}
                    class={'btn btn-danger btn-custom btn-block'}
                    swalType='danger'
                    swalConfirmBtnText='Yes, terminate it!'
                    swalTitle='Are you sure?' />
            </form>
        </div>
    </div>;
}
