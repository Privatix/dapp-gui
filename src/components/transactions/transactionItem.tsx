import * as React from 'react';

export default function(props:any){
    const elem = <tr>
        <td>{props.transaction.date}</td>
        <td>{props.transaction.ethAddr}</td>
    </tr>;
    return (elem);
}
