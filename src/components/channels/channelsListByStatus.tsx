import * as React from 'react';
import ChannelItem from './channelItem';
import {fetch} from 'utils/fetch';
import {asyncReactor} from 'async-reactor';

function Loader() {

  return (<h2>Loading channels ...</h2>);

}

async function AsyncChannels (props:any){

    const endpoint = `/channels?serviceStatus=${props.status}`;

    const channels = await fetch(endpoint, {method: 'GET'});

    const channelsDOM = (channels as any).map((channel: any) => <ChannelItem channel={channel} />);

    return <div className='row'>
                <div className='col-12'>
                    <div className='card-box'>
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
          </div>;
}

export default asyncReactor(AsyncChannels, Loader);
