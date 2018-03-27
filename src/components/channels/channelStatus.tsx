import * as React from 'react';
import {ipcRenderer} from 'electron';
import {fetchFactory} from '../../fetch';
const fetch = fetchFactory(ipcRenderer);

export default function(props:any){
    const id = `channel${props.channelId}Status`;
    const status = <span id={id}></span>;
    const handler = () => {
        fetch(`/channels/${props.channelId}/status`, {}).then(res => {
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
