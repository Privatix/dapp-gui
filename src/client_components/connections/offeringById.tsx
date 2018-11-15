import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../../typings/state';
import Offering from '../vpn_list/acceptOffering';

class OfferingById extends React.Component<any, any>{

    constructor(props:any){
        super(props);

        // Set default empty offering properties for rendering component Offering without errors and visual modal rerenderings
        this.state = {
            offering: {
                country: '',
                unitPrice: 0,
                maxInactiveTimeSec: 0,
            }
        };
    }

    async componentDidMount(){
        const offering = await this.props.ws.getOffering(this.props.offeringId);
        this.setState({offering});
    }

    render(){
        const offering = this.state.offering;
        return <Offering mode='view' offering={offering} />;
    }
}

export default connect( (state: State) => ({ws: state.ws}) )(OfferingById);
