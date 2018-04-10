import * as React from 'react';
import { Link } from 'react-router-dom';

export default function(props:any){
    const elem = <li>
        <Link to={`/session/${JSON.stringify(props.session)}`}>{props.session.id}</Link>
    </li>;
    return (elem);
}
