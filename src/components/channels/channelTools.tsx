import * as React from 'react';
import ChannelToolClose from './channelToolClose';

export default function(props:any){

    return <div className='col-lg-3 col-md-4'>
        <div className='card m-b-20 card-body text-xs-center cardHoverBgDanger'>
            <form>
                <h5 className='card-title'>Warning Area</h5>
                <p className='card-text'>This operation will terminate the service and call the "Uncooperative close" procedure</p>
                <p className='text-center'><ChannelToolClose channelId={props.channel.id} /></p>
            </form>
        </div>
    </div>;
}
