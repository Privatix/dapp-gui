import * as React from 'react';
import ChannelView from './channelView';
import ChannelTools from './channelTools';
import SessionList from '../sessions/sessionsList';

export default function(props:any){

    const channel = props.channel;

    return <div>
        <div className='container-fluid'>
            <div className='row'>
                <ChannelView {...props}/>
                <ChannelTools channel={channel} />
            </div>
            <div className='row'>
                <div className='col-sm-12 m-b-15'>
                    <h3 className='page-title'>Sessions</h3>
                </div>
            </div>
        </div>
        <SessionList channel={channel.id}/>
    </div>;

}
