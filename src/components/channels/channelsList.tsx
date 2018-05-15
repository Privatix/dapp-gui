import * as React from 'react';
// import { Link } from 'react-router-dom';
import {fetch} from 'utils/fetch';
import {asyncReactor} from 'async-reactor';
import ChannelItem from './channelItem';

function Loader() {

  return (<h2>Loading channels ...</h2>);

}

async function AsyncChannels (props:any){

    let endpoint;

    if(props.offering){
        endpoint = '/channels' + (props.offering === 'all' ? '' : `?offeringId=${props.offering}`);
    }else{
        endpoint = '/channels' + (props.match.params.offering === 'all' ? '' : `?offeringId=${props.match.params.offering}`);
    }


//    const endpoint = '/channels' + (props.match.params.offering === 'all' ? '' : `?offeringId=${props.match.params.offering}`);
    const channels = await fetch(endpoint, {method: 'GET'});
    const channelsDOM = (channels as any).map((channel: any) => <ChannelItem channel={channel} />);
    /*
    return <div>
        <h3>Active Services</h3>
        {title}
        <hr />
        {channelsDOM}
        <hr />
        <Link to={'/'}>back</Link>
    </div>;
   */
    return <div className='container-fluid'>
        <div className='row'>
            <div className='col-sm-12 m-b-15'>
                <h3 className='page-title'>Active Services</h3>
            </div>
        </div>
            <div className='row'>
                <div className='col-12'>
                    <div className='card-box'>
                        <div className='table-responsive'>
                            <table className='table table-bordered table-striped'>
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Server</th>
                                        <th>Client</th>
                                        <th>Contract Status</th>
                                        <th>Service Status</th>
                                        <th>Usage</th>
                                        <th>Income (PRIX)</th>
                                        <th>Service Changed Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {channelsDOM}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
          </div>
        </div>;
}

export default asyncReactor(AsyncChannels, Loader);
