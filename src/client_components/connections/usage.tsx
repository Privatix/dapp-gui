import * as React from 'react';
import * as api from '../../utils/api';

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

        const maxUsage = 'offering' in this.state ? Math.floor((this.props.channel.deposit - this.state.offering.setupPrice)/this.state.offering.unitPrice)
                                                  : '';
        const channel = this.props.channel;

        return <span>{`${channel.usage.current} of ${maxUsage} ${channel.usage.unit}`}</span>;
    }
}
