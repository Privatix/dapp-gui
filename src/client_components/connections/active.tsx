import * as React from 'react';
import {asyncReactor} from 'async-reactor';

function Loader() {
    return (<h2>Loading data ...</h2>);
}

async function AsyncActiveConnections (props:any){

    return <div className='row'>
        <div className='col-12'>
            <div className='card m-b-20'>
                <h5 className='card-header'>Active Connection:</h5>
                <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                    <div className='card-body'>
                        <table className='table table-bordered table-striped'>
                            <thead>
                            <tr>
                                <th>Id</th>
                                <th>Agent</th>
                                <th>Contract status</th>
                                <th>Service status</th>
                                <th>Job status</th>
                                <th>Usage</th>
                                <th>Cost (PRIX)</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>1111</td>
                                <td>Name</td>
                                <td><span className='label label-table label-primary'>Pending</span></td>
                                <td><span className='label label-table label-primary'>Pending</span></td>
                                <td>ClientPreChannelCreate (Done 13:32)</td>
                                <td>120 MB of 500 MB</td>
                                <td>0.01</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>;
}

export default asyncReactor(AsyncActiveConnections, Loader);
