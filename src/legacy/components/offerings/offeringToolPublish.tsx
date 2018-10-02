import * as React from 'react';
import Button from '../../../components/button';

export default function(props:any){
    return <Button endpoint={`/offerings/${props.offeringId}/status`} options={{method: 'put', body: {action: 'publish'}}} title={'publish'}/>;
}
