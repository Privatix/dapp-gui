import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { State } from '../../typings/state';

class LinkToProductByOfferingId extend React.Component<any, any> {

    constructor(props:any){
        super(props);
        this.state = {offering: null};
    }

    async conponentDidMount(){
        const { ws, offeringId } = this.props;
        const offering = await ws.getOffering(offeringId);
        this.setState({offering});
    }

    render {
        const product = this.state.offering ? this.state.offering.product : '';
        return (
            <Link to={`/productById/${product}`}>{props.children}</Link>
       );
    }
}

export default connect((state: State, onProps: Props) => {
    return (Object.assign({}, {ws: state.ws}, onProps));
})(LinkToProductByOfferingId);
