import * as React from 'react';
// import { Link } from 'react-router-dom';
import {fetch} from '../../utils/fetch';
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
        <div className='container-fluid'>
        <div className='row'>
            <div className='col-sm-12 m-b-15'>
                <h3 className='page-title'>Servers list</h3>
                {/*<div className='btn-group m-t-15 m-b-20'>*/}
                    {/*<Link to={'createProduct'} className='btn btn-default btn-custom waves-effect waves-light'>Create a server</Link>*/}
                {/*</div>*/}
            </div>
        </div>
            <div className='row'>
                <div className='col-12'>
                    <div className='card-box'>
                        <div className='table-responsive'>
                            <table className='table table-bordered table-striped'>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Template</th>
                                        <th>End Point</th>
                                        <th>Offering Count</th>
                                        <th></th>
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
        </div>
   );
}

export default asyncReactor(AsyncProducts, Loader);
