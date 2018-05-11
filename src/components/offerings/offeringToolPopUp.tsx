import * as React from 'react';
import Button from '../button';

export default function(props:any){
    return <Button endpoint={`/offerings/${props.offeringId}/status`} options={{method: 'put', body: {action: 'popup'}}} title={'Popup'} class='btn btn-primary btn-custom btn-block'/>;
}
