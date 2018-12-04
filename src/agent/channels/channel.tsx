import * as React from 'react';
import i18n from 'i18next/init';

import ChannelView from './channelView';
import ChannelTools from './channelTools';
import SessionList from 'agent/sessions/sessionsList';

export default function(props:any){

    const channel = props.channel;

    return <div>
        <div className='container-fluid'>
            <div className='row'>
                <ChannelView {...props}/>
                <ChannelTools channel={channel} />
            </div>
            <div className='row'>
                <div className='col-sm-12 m-b-15'>
                    <h3 className='page-title'>{i18n.t('channels/channelView:Sessions')}</h3>
                </div>
            </div>
        </div>
        <SessionList channel={channel.id}/>
    </div>;

}
