import * as React from 'react';
import {fetch} from 'utils/fetch';

export default function(props:any){
    const id = `product${props.productId}Status`;
    // console.log(id);
    const status = <span id={id}></span>;
    const handler = () => {
        fetch(`/product/{props.productId}/status`, {}).then(res => {
            const holder = document.getElementById(id);
            if(holder){
                holder.innerHTML = (res as any).status;
                setTimeout(handler, 1000);
            }
        });
    };
    setTimeout(handler, 1000);
    return status;
}
