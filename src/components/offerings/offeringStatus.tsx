import * as React from 'react';
import {fetch} from '../../utils/fetch';

export default class OfferingStatus extends React.Component<any, any>{

    constructor(props: any){
        super(props);
        this.state = {status: ''};
        this.update();
    }

    get classes() {

        return {register: 'success', remove: 'danger', empty: 'warning'};
    }

    update(){
        fetch(`/offerings/${this.props.offeringId}/status`, {}).then(res => {
            const status = (res as any).status;
            // let statusLabelClass = `label-${this.classes[status] ? this.classes[status] : 'inverse'}`;
            this.setState({status});
            setTimeout(this.update.bind(this), this.props.rate);
        });
    }

    render(){
        const status = this.state.status;
        return <span className={`label label-table label-${this.classes[status] ? this.classes[status] : 'inverse'}`} >{this.state.status}</span>;
    }
}
