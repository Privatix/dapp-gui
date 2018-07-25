import * as React from 'react';
import {fetch} from '../../utils/fetch';

export default class ChannelUsage extends React.Component <any,any> {

    constructor(props:any) {
        super(props);

        this.state = {
            channelId: props.channelId,
            usage: 0,
            lastUpdatedChannelId: 0
        };
    }

    static getDerivedStateFromProps(props:any, state:any) {
        return {
            channelId: props.channelId
        };
    }

    async getUsage() {

        const channelId = this.state.channelId;
        const endpoint = `/sessions?channelId=${this.state.channelId}`;
        const sessions = await fetch(endpoint, {method: 'GET'});
        const usage = (sessions as any).reduce( (usage, session) => {return usage + session.unitsUsed;}, 0);

        if (this.state.lastUpdatedChannelId === this.state.channelId && usage === this.state.usage) {
            return;
        }

        this.setState({usage, lastUpdatedChannelId: channelId});
    }

    render () {
        this.getUsage();

        return <span>{this.state.usage} MB</span>;
    }
}
