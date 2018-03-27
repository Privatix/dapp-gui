import * as React from 'react';
import Button from '../button';

export default function(props:any){
    return <Button endpoint={'/popupOffering'} options={{method: 'post', body: {id: props.offeringId}}} title={'popup'}/>;
}
