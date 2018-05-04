import * as React from 'react';
// import { Link } from 'react-router-dom';
import ChannelToolClose from './channelToolClose';

export default function(props:any){

    return <div>
        <form>
        <fieldset>
            <legend>Warning Area</legend>
            <label>This operation will terminate the service and call the "Uncooperative close" procedure
            <ChannelToolClose channelId={props.channel.id} /></label>
        </fieldset>
        </form>
    </div>;
}
