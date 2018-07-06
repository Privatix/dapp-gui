import * as React from 'react';
import { Link } from 'react-router-dom';
import OfferingsList from './offeringsList';
import ModalWindow from '../modalWindow';
import CreateOffering from './createOffering';
import { withRouter } from 'react-router-dom';
import {fetchOfferings} from './utils';

class Offerings extends React.Component<any, any>{

    constructor(props: any){
        super(props);
        this.state = {offerings: [], products: []};
    }

    // componentDidMount(){
    //     this.refresh();
    // }

    refresh(){
        fetchOfferings(this.props.product).then((res: any) => {
            this.setState(res);
        });
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
                        <ModalWindow visible={false} customClass='btn btn-default btn-custom waves-effect waves-light m-r-15' modalTitle='Create offering' text='Create an offering' component={<CreateOffering done={this.refresh.bind(this)} />} />
                        <Link to={'#'} onClick={this.refresh.bind(this)} className='btn btn-default btn-custom waves-effect waves-light'>Refresh all</Link>
                    </div>
                </div>
            </div>
            <OfferingsList product={this.props.product} rate={3000} />
       </div>;
    }
}

export default withRouter(Offerings);
