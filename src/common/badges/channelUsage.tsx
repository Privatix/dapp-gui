import * as React from 'react';
import { translate } from 'react-i18next';

import { WS, ws } from 'utils/ws';
import { ClientChannelUsage, ServiceStatus } from 'typings/channels';

import toFixedN from 'utils/toFixedN';

interface IProps {
    t?: any;
    ws?: WS;
    usage?: ClientChannelUsage;
    channelStatus: ServiceStatus;
    channelId: string;
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

        if(!usage){
            ws.getChannelUsage(channelId)
              .then(usage => {
                  this.setState({usage});
              });
        }
    }

    componentDidMount(){
        this.startRefresh();
    }

    componentWillUnmount(){
        this.stopRefresh();
    }

    startRefresh(){
        this.handlerId = setTimeout(this.refresh, 1000);
    }

    stopRefresh(){
        if(this.handlerId){
            clearTimeout(this.handlerId);
            this.handlerId = undefined;
        }
    }

    refresh = async () => {
        const { ws, channelId } = this.props;
        const usage = await ws.getChannelUsage(channelId);
        this.setState({usage});
        this.handlerId = setTimeout(this.refresh, 1000);
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
