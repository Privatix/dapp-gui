import * as React from 'react';

export default function(props:any){

    const sessionPropsDom = Object.keys(props.session).map(key => <tr><td>{key}</td><td>{props.session[key]}</td></tr>);

    return <div><h3>Session</h3>
    <hr />
    <table>
        {sessionPropsDom}
    </table>
    </div>;
}
