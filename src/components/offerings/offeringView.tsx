import * as React from 'react';

export default function(props:any){

    const offeringPropsDom = Object.keys(props.offering).map(key => <tr><td>{key}</td><td>{props.offering[key]}</td></tr>);
    return <div><h3>Offering</h3>
    <hr />
    <table>
        {offeringPropsDom}
    </table>
    </div>;
}
