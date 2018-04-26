import * as React from 'react';
// import { render } from 'react-dom';
import { Link } from 'react-router-dom';
import {fetch} from 'utils/fetch';
import {asyncReactor} from 'async-reactor';
// import AddProduct from './addProduct';
import ProductItem from './productItem';

/*
const onClick = function(evt:any){
    evt.preventDefault();
    evt.stopPropagation();
    render(<AddProduct />, document.getElementById('product'));
};
*/
function Loader() {

  return (<h2>Loading products ...</h2>);

}

async function AsyncProducts(props:any){
    const endpoint = '/products';
    const products = await fetch(endpoint, {method: 'GET'});
    const list = (products as any).map((product:any) => <ProductItem product={product} /> );
    return (
        <div className='container-fluid'>
        <div className='row'>
            <div className='col-sm-12 m-b-15'>
                <div className='btn-group pull-right m-t-15'>
                    <Link to={'createProduct'} className='btn btn-default waves-effect waves-light'>Create a product</Link>
                </div>
                <h3 className='page-title'>Products list</h3>
            </div>
        </div>
            <div className='row'>
                <div className='col-12'>
                    <div className='card-box'>
                        <table className='table table-bordered table-striped'>
                            <thead>
                                <tr>
                                <td>Name</td><td>Template</td><td>End Point</td><td>Offering Count</td><td></td>
                                </tr>
                            </thead>
                            <tbody>
                                {list}
                            </tbody>
                        </table>
                    </div>
                </div>
          </div>
        </div>
   );
}

export default asyncReactor(AsyncProducts, Loader);
