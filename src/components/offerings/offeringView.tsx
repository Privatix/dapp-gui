import * as React from 'react';

export default function(props:any){

    // const offeringPropsDom = Object.keys(props.offering).map(key => <tr><td>{key}</td><td>{props.offering[key]}</td></tr>);
    return <div><h5>Offering</h5>
    <hr />
        <h3>General info</h3>
        <label>Name: <input type='text' value={props.offering.serviceName} readOnly /></label><br />
        <label>Decsription: <input type='text' value={props.offering.description} readOnly /></label><br />
        <label>Country: <input type='text' value={props.offering.country} readOnly /></label><br />
        <label>Supply: <input type='text' value={props.offering.supply} readOnly /></label><br />
        <div>Maximum supply of services according to service offerings. It represents the maximum number of clients that can consume this service offering concurrently.</div>
        <h3>Billing info</h3>
        <label>Unit type: <select readOnly><option value='Mb'>Mb</option></select></label><br />
        <label>Price per Mb: <input type='text' value={props.offering.unitPrice} readOnly/></label><br />
        <label>Max billing unit lag: <input type='text' value={props.offering.maxBillingUnitLag} readOnly /></label><br />
        <div>Maximum payment lag  in  units after which Agent will suspend service usage</div>
        <label>Min units: <input type='text' value={props.offering.minUnits} readOnly/></label><br />
        <div>Used to calculate minimum deposit required</div>
        <label>Max units: <input type='text' value={props.offering.maxUnit}/></label><br />
        <div>Used to specify maximum units of service that will be supplied. Can be empty.</div>
        <h3>Connection info</h3>
        <label>Max suspend time: <input type='text' value={props.offering.maxSuspendTime} readOnly/></label><br />
        <div>Maximum time service can be in Suspended status due to payment log. After this time period service will be terminated, if no sufficient payment was recieved. Period is specified in seconds.</div>
        <label>Max inactive time: <input type='text' value={props.offering.maxInactiveTimeSec} readOnly /></label><br />
        <div>Maximum time whithout service usage. Agent will consider that Client will not use service and stop providing it. Period is specified in seconds.</div>
    </div>;
}
