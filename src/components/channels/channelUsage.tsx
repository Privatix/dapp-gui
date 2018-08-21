import * as React from 'react';
import * as api from '../../utils/api';

export default class ChannelUsage extends React.Component <any,any> {

    constructor(props:any) {
        super(props);

        this.state = {
            channelId: props.channelId,
            trafficLimit: props.trafficLimit,
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
        const sessions = await api.getSessions(this.state.channelId);
        const usage = sessions.reduce( (usage, session) => {return usage + session.unitsUsed;}, 0);

        if (this.state.lastUpdatedChannelId === this.state.channelId && usage === this.state.usage) {
            return;
        }

        this.setState({usage, lastUpdatedChannelId: channelId});
    }

    render () {
        this.getUsage();

        if (this.state.trafficLimit){
            return <span>{this.state.usage}&nbsp;of&nbsp;{this.state.trafficLimit}&nbsp;MB</span>;
        }else {
            return <span>{this.state.usage} MB</span>;
        }
    }
}
