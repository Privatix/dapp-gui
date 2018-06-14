import * as React from 'react';
import ChannelsListByStatus from './channelsListByStatus';

export default function (props:any){

    const status = props.status ? props.status : props.match.params.status;

    return <div className='container-fluid'>
        <div className='row'>
            <div className='col-sm-12 m-b-15'>
                <h3 className='page-title'>{status === 'active'  ? 'Active Services' : 'History'}</h3>
            </div>
        </div>
        <ChannelsListByStatus status={status} />
    </div>;
}
