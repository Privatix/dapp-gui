import * as React from 'react';
import { Link } from 'react-router-dom';
import {ipcRenderer} from 'electron';
import {fetchFactory} from '../../fetch';
const fetch = fetchFactory(ipcRenderer);
import {asyncReactor} from 'async-reactor';
import ProductItem from './productItem';

function Loader() {

  return (<h2>Loading products ...</h2>);

}

async function AsyncProducts(props:any){
    const endpoint = '/products';
    const products = await fetch(endpoint, {method: 'GET'});
    const list = (products as any).map((product:any) => <ProductItem product={product} /> );
    return (
        <div>
          <h3>products list</h3>
          <ul>
          {list}
          </ul>
          <hr />
          <Link to={'/'}>back</Link>
          </div>
   );
}

export default asyncReactor(AsyncProducts, Loader);
