import * as React from 'react';
import ChannelItem from './channelItem';

export default function ChannelsListPure (props:any){

    const channelsDOM = (props.channels as any).map((channel: any) => <ChannelItem key={channel.id} channel={channel} />);

    return <div className='container-fluid'>
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
