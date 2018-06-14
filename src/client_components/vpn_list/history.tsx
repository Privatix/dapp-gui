import * as React from 'react';
// import {fetch} from '../../utils/fetch';
import { withRouter } from 'react-router-dom';
import {asyncReactor} from 'async-reactor';
import SortableTable from 'react-sortable-table-vilan';

function Loader() {
    return (<h2>Loading data ...</h2>);
}

async function AsyncAcceptOffering (props:any){

    const pendingColumns = [
        {
            header: 'Id',
            key: 'id'
        },
        {
            header: 'Agent',
            key: 'agent'
        },
        {
            header: 'Contract status',
            key: 'contractStatus'
        },
        {
            header: 'Service status',
            key: 'serviceStatus'
        },
        {
            header: 'Job status',
            key: 'jobStatus'
        },
        {
            header: 'Usage',
            key: 'usage'
        },
        {
            header: 'Cost (PRIX)',
            key: 'cost'
        }
    ];
    const pendingData = [
        {
            id: '1111',
            agent: '',
            contractStatus: <span className='label label-table label-success'>Active</span>,
            serviceStatus: <span className='label label-table label-success'>Active</span>,
            jobStatus: 'ClientPreServiceTerminate (Done 13:32)',
            usage: '12 MB of 500 MB',
            cost: 0.01
        }
    ];

    const historyColumns = [
        {
            header: 'Id',
            key: 'id'
        },
        {
            header: 'Agent',
            key: 'agent'
        },
        {
            header: 'Contract status',
            key: 'contractStatus'
        },
        {
            header: 'Usage',
            key: 'usage'
        },
        {
            header: 'Cost (PRIX)',
            key: 'cost'
        },
        {
            header: 'Last used',
            key: 'lastUsed'
        }
    ];
    const historyData = [
        {
            id: '1111',
            agent: '',
            contractStatus: 'waiting to be closed cooperatively',
            usage: '14 MB',
            cost: 0.01,
            lastUsed: '8-May-18 14:08'
        }
    ];

    return <div className='col-lg-12 col-md-12'>
        <div className='card m-b-20'>
            <h5 className='card-header'>Pending</h5>
            <div className='card-body'>
                <div className='bootstrap-table bootstrap-table-sortable'>
                    <SortableTable
                        data={pendingData}
                        columns={pendingColumns}/>
                </div>
            </div>
        </div>

        <div className='card m-b-20'>
            <h5 className='card-header'>History</h5>
            <div className='card-body'>
                <div className='m-t-5 m-b-20'>
                    <button className='btn btn-default btn-custom waves-effect waves-light'>Refresh</button>
                    <button className='btn btn-danger btn-custom waves-effect waves-light pull-right'>Clear the History</button>
                </div>
                <div className='bootstrap-table bootstrap-table-sortable'>
                    <SortableTable
                        data={historyData}
                        columns={historyColumns}/>
                </div>
            </div>
        </div>
    </div>;
}

export default withRouter(asyncReactor(AsyncAcceptOffering, Loader));
