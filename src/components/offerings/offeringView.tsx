import * as React from 'react';
// import LinkToProductByOfferingId from '../products/linkToProductByOfferingId';
import ProductNameByOffering from '../products/productNameByOffering';

export default function(props:any){

    return <div className='col-lg-12 col-md-12'>
        <div className='card m-b-20 card-body'>
            <div className='form-group row m-b-0'>
                <label className='col-3 col-form-label'>Server: </label>
                <div className='col-9 col-form-label'>
                    {/*<LinkToProductByOfferingId offeringId={props.offering.id} >*/}
                        <ProductNameByOffering offeringId={props.offering.id} />
                    {/*</LinkToProductByOfferingId>*/}
                </div>
            </div>
        </div>
        <div className='card m-b-20'>
            <h5 className='card-header'>General info</h5>
            <div className='card-body'>
                <div className='form-group row'>
                    <label className='col-3 col-form-label'>Name: </label>
                    <div className='col-9'>
                        <input type='text' className='form-control' value={props.offering.serviceName} readOnly/>
                    </div>
                </div>
                <div className='form-group row'>
                    <label className='col-3 col-form-label'>Description: </label>
                    <div className='col-9'>
                        <input type='text' className='form-control' value={props.offering.description} readOnly/>
                    </div>
                </div>
                <div className='form-group row'>
                    <label className='col-3 col-form-label'>Country: </label>
                    <div className='col-9'>
                        <input type='text' className='form-control' value={props.offering.country} readOnly/>
                    </div>
                </div>
                <div className='form-group row'>
                    <label className='col-3 col-form-label'>Supply: </label>
                    <div className='col-9'>
                        <input type='text' className='form-control' value={props.offering.supply} readOnly/>
                        <span className='help-block'>
                            <small>
                                Maximum supply of services according to service offerings.
                                It represents the maximum number of clients that can consume this service offering concurrently.
                            </small>
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div className='card m-b-20'>
            <h5 className='card-header'>Billing info</h5>
            <div className='card-body'>
                <div className='form-group row'>
                    <label className='col-3 col-form-label'>Unit type:</label>
                    <div className='col-9'>
                        <select className='form-control' disabled>
                            <option value='Mb'>MB</option>
                        </select>
                    </div>
                </div>
                <div className='form-group row'>
                    <label className='col-3 col-form-label'>Price per MB:</label>
                    <div className='col-9'>
                        <div className='input-group bootstrap-touchspin'>
                            <input type='text' className='form-control' value={props.offering.unitPrice} readOnly/>
                            <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                        </div>
                    </div>
                </div>
                <div className='form-group row'>
                    <label className='col-3 col-form-label'>Max billing unit lag:</label>
                    <div className='col-9'>
                        <div className='input-group bootstrap-touchspin'>
                            <input type='text' className='form-control' value={props.offering.maxBillingUnitLag} readOnly/>
                            <span className='input-group-addon bootstrap-touchspin-postfix'>MB</span>
                        </div>
                        <span className='help-block'>
                            <small>Maximum payment lag in units after which Agent will suspend service usage.</small>
                        </span>
                    </div>
                </div>
                <div className='form-group row'>
                    <label className='col-3 col-form-label'>Min units:</label>
                    <div className='col-9'>
                        <div className='input-group bootstrap-touchspin'>
                            <input type='text' className='form-control' value={props.offering.minUnits} readOnly/>
                            <span className='input-group-addon bootstrap-touchspin-postfix'>MB</span>
                        </div>
                        <span className='help-block'>
                            <small>Used to calculate minimum deposit required.</small>
                        </span>
                    </div>
                </div>
                <div className='form-group row'>
                    <label className='col-3 col-form-label'>Max units:</label>
                    <div className='col-9'>
                        <div className='input-group bootstrap-touchspin'>
                            <input type='text' className='form-control' value={props.offering.maxUnit} readOnly/>
                            <span className='input-group-addon bootstrap-touchspin-postfix'>MB</span>
                        </div>
                        <span className='help-block'>
                            <small>Used to specify maximum units of service that will be supplied. Can be empty.</small>
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div className='card m-b-20'>
            <h5 className='card-header'>Connection info</h5>
            <div className='card-body'>
                <div className='form-group row'>
                    <label className='col-3 col-form-label'>Max suspend time:</label>
                    <div className='col-9'>
                        <div className='input-group bootstrap-touchspin'>
                            <input type='text' className='form-control' value={props.offering.maxSuspendTime} readOnly/>
                            <span className='input-group-addon bootstrap-touchspin-postfix'>sec</span>
                        </div>
                        <span className='help-block'>
                            <small>Maximum time service can be in Suspended status due to payment log.
                                After this time period service will be terminated, if no sufficient payment was received.
                                Period is specified in seconds.</small>
                        </span>
                    </div>
                </div>
                <div className='form-group row'>
                    <label className='col-3 col-form-label'>Max inactive time:</label>
                    <div className='col-9'>
                        <div className='input-group bootstrap-touchspin'>
                            <input type='text' className='form-control' value={props.offering.maxInactiveTimeSec} readOnly/>
                            <span className='input-group-addon bootstrap-touchspin-postfix'>sec</span>
                        </div>
                        <span className='help-block'>
                            <small>Maximum time without service usage.
                                Agent will consider that Client will not use service and stop providing it.
                                Period is specified in seconds.</small>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>;
}
