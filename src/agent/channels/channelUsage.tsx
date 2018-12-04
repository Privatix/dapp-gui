import * as React from 'react';
import { translate } from 'react-i18next';

import { WS, ws } from 'utils/ws';
import toFixedN from 'utils/toFixedN';

interface IProps {
    t?: any;
    ws?: WS;
    channelId: string;
}

@translate(['channels/channelUsage'])
class ChannelUsage extends React.Component <any,any> {

    constructor(props:any) {
        super(props);

        this.state = {
            usage: null
        };
    }

    static getDerivedStateFromProps(props:any, state:any) {
        return {
            channelId: props.channelId
        };
    }

    async getUsage() {

        const { ws } = this.props;

        const { channelId, lastUpdatedChannelId } = this.state;

        const usage = await ws.getChannelUsage(channelId);

        if (lastUpdatedChannelId === channelId /* && usage === this.state.usage */) {
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

export default ws<IProps>(ChannelUsage);
