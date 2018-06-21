import * as React from 'react';
import {asyncReactor} from 'async-reactor';

function Loader() {

  return (<h4>Loading info ...</h4>);

}

async function AsyncProductView(props:any){

    return <div>
        <table className='table table-striped'>
            <tbody>
                <tr><td>Name:</td><td>{props.product.name}</td></tr>
                <tr><td>Host:</td><td>{'192.168.0.1'}</td></tr>
                <tr><td>Additional params:</td><td>{'coming soon'}</td></tr>
            </tbody>
        </table>
    </div>;
}

export default asyncReactor(AsyncProductView, Loader);
