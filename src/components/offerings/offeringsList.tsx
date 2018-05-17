import * as React from 'react';
// import { Link } from 'react-router-dom';
import {fetch} from 'utils/fetch';
import {asyncReactor} from 'async-reactor';
import OfferingItem from './offeringItem';


function Loader() {

  return (<h2>Loading offerings ...</h2>);

}

async function AsyncOfferings (props: any){

    let endpoint;

    if(props.product){
        endpoint = '/offerings' + (props.product === 'all' ? '' : `?product=${props.product}`);
    }else{
        endpoint = '/offerings' + (props.match.params.product === 'all' ? '' : `?product=${props.match.params.product}`);
    }


    const offeringsRequest = fetch(endpoint, {method: 'GET'});
    const productsRequest = fetch('/products', {});
    let offerings, products;
    [offerings, products] = await Promise.all([offeringsRequest, productsRequest]);

    const resolveTable = (products as any).reduce((table, product) => {
        table[product.id] = product.name;
        return table;
    });

    offerings = (offerings as any).map(offering => Object.assign(offering, {productName: resolveTable[offering.product]}));

    const offeringsDOM = (offerings as any).map((offering: any) => <OfferingItem offering={offering} />);

    return <div className='row'>
                <div className='col-12'>
                    <div className='card-box'>
                        <table className='table table-bordered table-striped'>
                            <thead>
                                <tr>
                                <td>Id</td><td>Service name</td><td>Server</td><td>Status</td><td>Free Units</td><td>Max Units</td>
                                </tr>
                            </thead>
                            <tbody>
                                {offeringsDOM}
                            </tbody>
                        </table>
                    </div>
                </div>
          </div>;
}

export default asyncReactor(AsyncOfferings, Loader);
