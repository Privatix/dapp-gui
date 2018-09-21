import * as React from 'react';
import * as api from '../../utils/api';
import { translate } from 'react-i18next';

@translate('client/connections/usage')

export default class JobStatus extends React.Component<any, any>{

    constructor(props: any){
        super(props);
        this.state = {};
    }

    refresh(){
        if(!('offering' in this.state) || this.state.offering.id !== this.props.channel.offering){
            api.getClientOfferings()
               .then(offerings => {
                   const offering = offerings.find(offering => offering.id === this.props.channel.offering);
                   if(offering){
                       this.setState({offering});
                   }
               });
        }
    }

    render(){

        this.refresh();

        const channel = this.props.channel;
        const { t } = this.props;

        return <span>{`${channel.usage.current} ${t('of')} ${channel.usage.maxUsage} ${channel.usage.unit}`}</span>;
    }
}
