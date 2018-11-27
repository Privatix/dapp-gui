import * as React from 'react';
import { translate } from 'react-i18next';
import toFixedN from '../../utils/toFixedN';

@translate(['channels/channelUsage'])

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
        const usage = await (window as any).ws.getChannelUsage(channelId);

        if (this.state.lastUpdatedChannelId === this.state.channelId && usage === this.state.usage) {
            return;
        }

        this.setState({usage, lastUpdatedChannelId: channelId});
    }

    render () {
        this.getUsage();

        const { t } = this.props;

        if (this.state.trafficLimit){
            return <span>{toFixedN({number: this.state.usage, fixed: 2})}&nbsp;{t('of')}&nbsp;{toFixedN({number: this.state.trafficLimit, fixed: 2})}&nbsp;MB</span>;
        }else {
            return <span>{toFixedN({number: this.state.usage, fixed: 2})} MB</span>;
        }
    }
}
