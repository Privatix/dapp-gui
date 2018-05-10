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


//    const endpoint = '/offerings' + (props.match.params.product === 'all' ? '' : `?product=${props.match.params.product}`);
    const offerings = await fetch(endpoint, {method: 'GET'});
    /*
    const title = 
        props.match.params.product === 'all'
        ? <h3>offerings list for all products</h3>
        : <h3>offerings list for product: {props.match.params.product}</h3>;
       */
    const offeringsDOM = (offerings as any).map((offering: any) => <OfferingItem offering={offering} />);
    /*
    return <div> 
        Offerings
        <hr />
        {offeringsDOM}
        <hr />
        <Link to={'/'}>back</Link>
    </div>;
*/
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
