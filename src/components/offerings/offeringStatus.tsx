import * as React from 'react';
import {fetch} from '../../utils/fetch';

export default function(props:any){
    const id = `offering${props.offeringId}Status`;
    const status = <span id={id}></span>;
    const handler = () => {
        fetch(`/offerings/${props.offeringId}/status`, {}).then(res => {
            const holder = document.getElementById(id);
            if(holder){
                let status = (res as any).status;
                let statusLabelClass = 'label-';
                holder.innerHTML = status;

                switch (status) {
                    case 'register':
                        statusLabelClass += 'success';
                        break;
                    case 'remove':
                        statusLabelClass += 'danger';
                        break;
                    case 'empty':
                        statusLabelClass += 'warning';
                        break;
                    default:
                        statusLabelClass += 'inverse';
                }

                holder.className = '';
                holder.className = 'label label-table ' + statusLabelClass;

                setTimeout(handler, 1000);
            }
        });
    };
    setTimeout(handler, 1000);
    return status;
}
