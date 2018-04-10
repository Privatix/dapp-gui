import * as React from 'react';

export default function (props:any){
    const endpointPropsDom = Object.keys(props.endpoint).map(key => <tr><td>{key}</td><td>{props.endpoint[key]}</td></tr>);
    return <div><h3>endpoint</h3>
    <hr />
    <table>
        {endpointPropsDom}
    </table>
    </div>;
}
