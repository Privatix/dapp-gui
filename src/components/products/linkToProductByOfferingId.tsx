import * as React from 'react';
import { Link } from 'react-router-dom';
import {fetch} from 'Utils/fetch';
import {asyncReactor} from 'async-reactor';

function Loader() {

  return (<b>Loading data ...</b>);

}

async function AsyncLink(props:any){
    const endpoint = `/offerings/?id=${props.offeringId}`;
    const offerings = await fetch(endpoint, {method: 'GET'});
    return (
        <Link to={`/productById/${offerings[0].product}`}>{props.children}</Link>
   );
}

export default asyncReactor(AsyncLink, Loader);
