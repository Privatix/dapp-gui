import * as React from 'react';
import {fetch} from '../../utils/fetch';

export default class OfferingStatus extends React.Component<any, any>{

    handler: number;

    constructor(props: any){
        super(props);
        this.state = {status: ''};
        this.handler = setTimeout(this.update.bind(this), 100);
    }

    get classes() {

        return {register: 'success', remove: 'danger', empty: 'warning'};
    }

    update(){
        fetch(`/offerings/${this.props.offeringId}/status`, {}).then(res => {
            const status = (res as any).status;
            // let statusLabelClass = `label-${this.classes[status] ? this.classes[status] : 'inverse'}`;
            if(this.handler){
                this.setState({status});
                this.handler = setTimeout(this.update.bind(this), this.props.rate);
            }
        });
    }

    componentWillUnmount(){
        if(this.handler){
            clearTimeout(this.handler);
            this.handler = null;
        }
    }

    render(){
        const status = this.state.status;
        return <span className={`label label-table label-${this.classes[status] ? this.classes[status] : 'inverse'}`} >{this.state.status}</span>;
    }
}
