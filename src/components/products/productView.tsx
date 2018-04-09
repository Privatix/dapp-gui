import * as React from 'react';
import { Link } from 'react-router-dom';

export default function(props:any){

    return <div>
        product view component will be here
        <hr />
        <h3>product name: {props.product.name}</h3>
        <Link to={`/template/${props.product.offerTplID}`}>Offering Template</Link>
        <Link to={`/template/${props.product.offerAccessID}`}>Access Template</Link>
    </div>;
}
