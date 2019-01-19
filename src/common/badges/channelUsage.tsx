import * as React from 'react';
import { translate } from 'react-i18next';

import { WS, ws } from 'utils/ws';
import { ClientChannelUsage } from 'typings/channels';

import toFixedN from 'utils/toFixedN';

interface IProps {
    t?: any;
    ws?: WS;
    usage?: ClientChannelUsage;
    channelId?: string;
    mode: string;
}

interface IState {
    usage?: ClientChannelUsage;
}

@translate('client/connections/usage')
class Usage extends React.Component<IProps, IState>{

    private handlerId =  undefined;

    constructor(props: IProps){
        super(props);
        const { channelId, usage, ws } = this.props;
        this.state = { usage };

        if(!usage && channelId){
            ws.getChannelsUsage([channelId])
              .then(usage => {
                  this.setState({usage: usage[0]});
              });
        }
    }

    componentDidMount(){
        if(this.props.channelId){
            this.startRefresh();
        }
    }

    componentWillUnmount(){
        this.stopRefresh();
    }

    startRefresh(){
        this.handlerId = setTimeout(this.refresh, 2000);
    }

    stopRefresh(){
        if(this.handlerId){
            clearTimeout(this.handlerId);
            this.handlerId = undefined;
        }
    }

    refresh = async () => {
        const { ws, channelId } = this.props;
        if(channelId){
            const usage = await ws.getChannelsUsage([channelId]);
            this.setState({usage: usage[0]});
            this.handlerId = setTimeout(this.refresh, 2000);
        }
    }

    render(){

        const { t, mode } = this.props;
        const { usage } = this.state;

        return mode === 'unit'
            ? (usage
                ? <span>{usage.current}&nbsp;{t('of')}&nbsp;{usage.maxUsage}&nbsp;{usage.unitName}</span>
                : <span></span>
              )
            : <span>{toFixedN({number: (usage.cost / 1e8), fixed: 8})}</span>;
    }
}

export default ws<IProps>(Usage);
