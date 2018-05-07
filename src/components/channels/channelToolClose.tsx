import * as React from 'react';
import Button from '../button';

export default function(props:any){

    return <Button endpoint={`/channels/${props.channelId}/status`} options={{method: 'put', body: {action: 'terminate'}}} title={'close'} class='btn btn-inverse waves-effect waves-light'/>;

}
