import * as React from 'react';
import { Link } from 'react-router-dom';
import {fetch} from 'utils/fetch';
import {asyncReactor} from 'async-reactor';
// import OfferingItem from './offeringItem';
import OfferingStatus from './offeringStatus';

import SortableTable from 'react-sortable-table';

function Loader() {

  return (<h2>Loading offerings ...</h2>);

}

async function AsyncOfferings (props: any){

    let endpoint;

    if(props.product){
        endpoint = '/offerings' + (props.product === 'all' ? '' : `?product=${props.product}`);
    }else{
        endpoint = '/offerings' + (props.match.params.product === 'all' ? '' : `?product=${props.match.params.product}`);
    }

//    const endpoint = '/offerings' + (props.match.params.product === 'all' ? '' : `?product=${props.match.params.product}`);
    const offerings = await fetch(endpoint, {method: 'GET'});

    /*
    const title = 
        props.match.params.product === 'all'
        ? <h3>offerings list for all products</h3>
        : <h3>offerings list for product: {props.match.params.product}</h3>;
       */
    // const offeringsDOM = (offerings as any).map((offering: any) => <OfferingItem offering={offering} />);

    const offeringsDataArr = [];
    (offerings as any).map((offering: any) => {

        let row = {
            id: <Link to={`/offering/${JSON.stringify(offering)}/`}>{offering.id}</Link>,
            serviceName: offering.serviceName,
            server: '[[ server ]]',
            status: <OfferingStatus offeringId={offering.id} />,
            freeUnits: offering.freeUnits,
            maxUnits: offering.maxUnit
        };

        offeringsDataArr.push(row);
    });

    const columns = [
        {
            header: 'ID',
            key: 'id'
        },
        {
            header: 'Service name',
            key: 'serviceName'
        },
        {
            header: 'Server',
            key: 'server'
        },
        {
            header: 'Status',
            key: 'status',
            headerStyle: {textAlign: 'center'},
            dataProps: {className: 'text-center'},
        },
        {
            header: 'Free Units',
            key: 'freeUnits',
            headerStyle: {textAlign: 'center'},
            dataProps: { className: 'text-center'},
        },
        {
            header: 'Max Units',
            key: 'maxUnits',
            headerStyle: {textAlign: 'center'},
            dataProps: { className: 'text-center'},
        }
    ];

    /*
    return <div> 
        Offerings
        <hr />
        {offeringsDOM}
        <hr />
        <Link to={'/'}>back</Link>
    </div>;
*/
    return <div className='container-fluid'>
        <div className='row'>
            <div className='col-sm-12 m-b-15'>
                <h3 className='page-title'>Offerings</h3>
            </div>
        </div>
        <div className='row'>
            <div className='col-sm-12 m-b-20'>
                <div className='btn-group m-t-5'>
                    <Link to={'/createOffering'} className='btn btn-default waves-effect waves-light'>Create an offering</Link>
                </div>
            </div>
        </div>
            <div className='row'>
                <div className='col-12'>
                    <div className='card-box'>

                        {/*<table id='sortableTable' data-classes='' className='table table-bordered table-striped'>*/}
                            {/*<thead>*/}
                                {/*<tr>*/}
                                    {/*<th data-field='id' data-sortable='true'>Id</th>*/}
                                    {/*<th data-sortable='true'>Service name</th>*/}
                                    {/*<th data-sortable='true'>Server</th>*/}
                                    {/*<th data-sortable='true'>Status</th>*/}
                                    {/*<th data-sortable='true'>Free Units</th>*/}
                                    {/*<th data-sortable='true'>Max Units</th>*/}
                                {/*</tr>*/}
                            {/*</thead>*/}
                            {/*<tbody>*/}
                                {/*{offeringsDOM}*/}
                            {/*</tbody>*/}
                        {/*</table>*/}


                        {/*<BootstrapTable data={offeringsDataArr} striped hover>*/}
                            {/*<TableHeaderColumn isKey dataField='id'>ID</TableHeaderColumn>*/}
                            {/*<TableHeaderColumn dataField='serviceName'>Service name</TableHeaderColumn>*/}
                            {/*<TableHeaderColumn dataField='server'>Server</TableHeaderColumn>*/}
                            {/*<TableHeaderColumn dataField='status'>Status</TableHeaderColumn>*/}
                            {/*<TableHeaderColumn dataField='freeUnits'>Free Units</TableHeaderColumn>*/}
                            {/*<TableHeaderColumn dataField='maxUnits'>Max Units</TableHeaderColumn>*/}
                        {/*</BootstrapTable>*/}

                        <div className='bootstrap-table bootstrap-table-sortable'>
                            <SortableTable
                                data={offeringsDataArr}
                                columns={columns} />
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>;
}

export default asyncReactor(AsyncOfferings, Loader);
