import * as React from 'react';
import { translate } from 'react-i18next';

@translate('client/connections/usage')

export default class JobStatus extends React.Component<any, any>{

    constructor(props: any){
        super(props);
        this.state = {};
    }

    async refresh(){
        if(!('offering' in this.state) || this.state.offering.id !== this.props.channel.offering){
            const offering = await (window as any).ws.getOffering(this.props.channel.offering);
            if(offering){
                this.setState({offering});
            }
        }
    }

    render(){

        this.refresh();

        const channel = this.props.channel;
        const { t } = this.props;

        return <span>{`${channel.usage.current} ${t('of')} ${channel.usage.maxUsage} ${channel.usage.unit}`}</span>;
    }
}
