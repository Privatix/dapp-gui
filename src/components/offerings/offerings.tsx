import * as React from 'react';
import OfferingsList from './offeringsList';
import ModalWindow from '../modalWindow';
import CreateOffering from './createOffering';
import { withRouter } from 'react-router-dom';

class Offerings extends React.Component<any, any>{

    constructor(props: any){
        super(props);
        this.state = {popup: false};
    }

    onOfferingCreated(){
        this.setState({popup: false});
        // props.history.push('/offerings/all');
    }

    render(){
        return <div className='container-fluid'>
            <div className='row'>
                <div className='col-sm-12 m-b-15'>
                    <h3 className='page-title'>Offerings</h3>
                </div>
            </div>
            <div className='row'>
                <div className='col-sm-12 m-b-20'>
                    <div className='btn-group m-t-5'>
                        <ModalWindow visible={this.state.popup} customClass='btn btn-default btn-custom waves-effect waves-light' modalTitle='Create offering' text='Create an offering' component={<CreateOffering done={this.onOfferingCreated.bind(this)} />} />
                    </div>
                </div>
            </div>
            <OfferingsList product={this.props.match.params.product ? this.props.match.params.product : 'all'} rate={3000} />
       </div>;
    }
}

export default withRouter(Offerings);
