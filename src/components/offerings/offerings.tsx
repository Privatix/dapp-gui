import * as React from 'react';
import OfferingsList from './offeringsList';
import ModalWindow from '../modalWindow';
import CreateOffering from './createOffering';

export default function(props:any){
    
    return <div className='container-fluid'>
        <div className='row'>
            <div className='col-sm-12 m-b-15'>
                <h3 className='page-title'>Offerings</h3>
            </div>
        </div>
        <div className='row'>
            <div className='col-sm-12 m-b-20'>
                <div className='btn-group m-t-5'>
                    <ModalWindow data={null} class='btn btn-default btn-custom waves-effect waves-light' text='Create an offering' component={<CreateOffering />} />
                </div>
            </div>
        </div>
        <OfferingsList product={props.match.params.product ? props.match.params.product : 'all'} />
   </div>;
}
