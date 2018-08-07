import * as React from 'react';

// import ChannelToolClose from './channelToolClose';
import ConfirmPopupSwal from '../confirmPopupSwal';

export default function(props:any){

    const warning = 'You can’t undo this.';
    const info = props.channel.receiptBalance === 0
        ? 'This operation will terminate service and prevent Clients from using this service.'
        : 'This operation will terminate service and close contract. Earnings will be transferred to your account.';

    const buttonTitle = props.channel.receiptBalance === 0
        ? 'Terminate service'
        : 'Terminate contract';

    return ['active', 'pending'].includes(props.channel.channelStatus) && props.channel.serviceStatus !== 'terminated'
        ? <div className='col-lg-3 col-md-4'>
            <div className='card m-b-20 card-body text-xs-center warningAreaCard'>
                <form>
                    <h5 className='card-title'>Warning Area</h5>
                    <p className='card-text'>{info}</p>
                    <ConfirmPopupSwal
                        endpoint={`/channels/${props.channel.id}/status`}
                        options={{method: 'put', body: {action: 'terminate'}}}
                        title={buttonTitle}
                        text={<span>{`${info} ${warning}`}</span>}
                        class={'btn btn-danger btn-custom btn-block'}
                        swalType='danger'
                        swalConfirmBtnText='Yes, terminate it!'
                        swalTitle='Are you sure?' />
                </form>
            </div>
        </div>
        :<div></div>;
}
