import * as React from 'react';
import PgTime from '../utils/pgTime';

export default function(props:any){

    const elem = <tr>
                     <td>{props.session.id}</td>
                     <td><PgTime time={props.session.started} /></td>
                     <td><PgTime time={props.session.stopped} /></td>
                     <td>{props.session.unitsUsed}</td>
                     <td><PgTime time={props.session.lastUsageTime} /></td>
                     <td>{props.session.clientIP}</td>
                 </tr>;
    return (elem);
}
