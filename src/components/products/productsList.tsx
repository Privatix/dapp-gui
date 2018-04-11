import * as React from 'react';
import { render } from 'react-dom';
import { Link } from 'react-router-dom';
import {fetch} from 'utils/fetch';
import {asyncReactor} from 'async-reactor';
import AddProduct from './addProduct';
import ProductItem from './productItem';

const onClick = function(evt:any){
    evt.preventDefault();
    evt.stopPropagation();
    render(<AddProduct />, document.getElementById('product'));
};

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
           <a href='' onClick={onClick}>+ Add product</a> | <Link to={'/'}>back</Link>
           <hr />
          <div id='product'></div>
          </div>
   );
}

export default asyncReactor(AsyncProducts, Loader);
