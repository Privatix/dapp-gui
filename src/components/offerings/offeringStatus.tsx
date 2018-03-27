import * as React from 'react';
import {ipcRenderer} from 'electron';
import {fetchFactory} from '../../fetch';
const fetch = fetchFactory(ipcRenderer);
// import { render } from 'react-dom';

export default function(props:any){
    const id = `offering${props.offeringId}Status`;
    const status = <span id={id}></span>;
    const handler = () => {
        fetch(`/offerings/${props.offeringId}/status`, {}).then(res => {
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
