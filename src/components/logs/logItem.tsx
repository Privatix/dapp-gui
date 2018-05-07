import * as React from 'react';

export default function(props:any){

    const elem = <tr>
                     <td><span className={'label label-' + props.log.severity}>{props.log.severity}</span></td>
                     <td>{props.log.date}</td>
                     <td>{props.log.event}</td>
                 </tr>;
    return elem;
}
