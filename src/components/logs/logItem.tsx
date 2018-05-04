import * as React from 'react';

export default function(props:any){

    const elem = <tr>
                     <td>{props.log.severity}</td>
                     <td>{props.log.date}</td>
                     <td>{props.log.event}</td>
                 </tr>;
    return elem;
}
