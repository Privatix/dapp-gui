import * as React from 'react';

export default function(props:any){

    let severity = 'label label-';
    switch (props.log.severity) {
        case 'warning':
            severity += 'warning'; break;
        case 'error':
            severity += 'danger'; break;
        case 'info':
            severity += 'success'; break;
    }

    const elem = <tr>
                     <td><span className={severity}>{props.log.severity}</span></td>
                     <td>{props.log.date}</td>
                     <td>{props.log.event}</td>
                 </tr>;
    return elem;
}
