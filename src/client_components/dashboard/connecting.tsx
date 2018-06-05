import * as React from 'react';
import {asyncReactor} from 'async-reactor';
import ActiveConnection from '../connections/active';

function Loader() {
    return (<h2>Loading data ...</h2>);
}

async function AsyncConnecting (props:any){

    return <div className='container-fluid'>
        <div className='row m-t-20'>
            <div className='col-5'>
                <div className='card m-b-20 card-body'>
                    <p className='card-text'>After the connection is ready, you can start using the VPN.</p>
                    <p className='card-text m-t-5 m-b-20'>Elapsed time: 5 min</p>
                    <button className='btn btn-inverse btn-block btn-lg disabled'>
                        <span className='loadingIconBl'><i className='fa fa-spin fa-refresh'></i></span>Connecting
                    </button>
                </div>
            </div>
        </div>

        <ActiveConnection />
    </div>;
}

export default asyncReactor(AsyncConnecting, Loader);
