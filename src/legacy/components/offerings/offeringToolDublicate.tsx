import * as React from 'react';
import { Link } from 'react-router-dom';

export default function(props:any){
    return <Link to={`/filledOffering/${JSON.stringify(props.offering)}`}>copy this offering</Link>;
}
