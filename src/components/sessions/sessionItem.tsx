import * as React from 'react';

export default function(props:any){

    const elem = <tr>
                     <td>{props.session.id}</td>
                     <td>{props.session.started}</td>
                     <td>{props.session.stopped}</td>
                     <td>[[ USAGE ]]</td>
                     <td>{props.session.lastUsageTime}</td>
                     <td>{props.session.clientIP}</td>
                 </tr>;
    return (elem);
}
