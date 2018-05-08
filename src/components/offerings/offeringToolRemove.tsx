import * as React from 'react';
import Button from '../button';

export default function(props:any){
    return <Button endpoint={`/offerings/${props.offeringId}/status`} options={{method: 'put', body: {action: 'remove'}}} title={'Remove'} class='btn btn-inverse waves-effect waves-light'/>;
}
