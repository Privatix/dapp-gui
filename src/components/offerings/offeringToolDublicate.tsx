import * as React from 'react';
import { Link } from 'react-router-dom';

export default function(props:any){
    return <div>
        <Link to={`/filledOffering/${JSON.stringify(props.offering)}`}>copy offering id: {props.offering.id}</Link>
    </div>;
}
