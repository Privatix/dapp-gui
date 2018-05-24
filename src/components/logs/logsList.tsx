import * as React from 'react';
import {fetch} from 'utils/fetch';
import {asyncReactor} from 'async-reactor';
import SortableTable from 'react-sortable-table';
import { HtmlElSorter } from '../utils/sortingHtmlEl';
declare const jQuery;

function Loader() {

  return (<h2>Loading logs ...</h2>);

}

async function AsyncLogs(props:any){

    const endpoint = '/logs';
    const logs = await fetch(endpoint, {method: 'GET'});

    const logsDataArr = [];
    (logs as any).map((log: any) => {
        let severity = 'label label-';
        switch (log.severity) {
            case 'warning':
                severity += 'warning'; break;
            case 'error':
                severity += 'danger'; break;
            case 'info':
                severity += 'success'; break;
        }

        let row = {
            severity: <span className={severity}>{log.severity}</span>,
            date: log.date,
            event: log.event
        };

        logsDataArr.push(row);
    });

    const columns = [
        {
            header: 'Severity',
            key: 'severity',
            descSortFunction: HtmlElSorter.desc,
            ascSortFunction: HtmlElSorter.asc
        },
        {
            header: 'Date',
            key: 'date'
        },
        {
            header: 'Event',
            key: 'event'
        }
    ];

    const exportToFile = function(){
        // 
    };
    const selectInfo = function(){
        // 
    };
    const selectWarnings = function(){
        // 
    };
    const selectErrors = function(){
        // 
    };
    const setNow = function(){
        // 
    };

    jQuery(document).ready(() => {
        jQuery('#dateFrom').datepicker();
        jQuery('#dateTo').datepicker();
    });

    return (
        <div className='container-fluid'>
            <div className='row'>
                <div className='col-sm-12 m-b-15'>
                    <h3 className='page-title'>Logs list</h3>
                </div>
            </div>
            <div className='row'>
                <div className='col-12'>
                    <div className='card-box'>
                        <div>
                            <button className='btn btn-default btn-custom waves-effect waves-light m-b-15' onClick={exportToFile} >Export to a file</button>
                        </div>
                        <div className='form-group row'>
                            <div className='col-md-12 m-t-10 m-b-10'>
                                <div className='input-group searchInputGroup'>
                                    <div className='input-group-prepend'>
                                        <span className='input-group-text'><i className='fa fa-search'></i></span>
                                    </div>
                                    <input className='form-control' type='search' name='search' placeholder='search' />
                                </div>
                            </div>
                        </div>
                        <div className='row m-b-20'>
                            <div className='col-xl-5 col-lg-12 col-md-12 col-sm-12 col-xs-12 button-list m-b-10'>
                                <button onClick={selectInfo} className='btn btn-success btn-rounded waves-effect waves-light w-md'>Info</button>
                                <button onClick={selectWarnings} className='btn btn-warning btn-rounded waves-effect waves-light w-md'>warning</button>
                                <button onClick={selectErrors} className='btn btn-danger btn-rounded waves-effect waves-light w-md'>error</button>
                            </div>
                            <div className='col-xl-3 col-lg-5 col-md-5 col-sm-5 col-xs-10 col-10'>
                                <div className='form-group row'>
                                    <label className='col-md-2 col-2 col-form-label text-right'>From:</label>
                                    <div className='col-md-10 col-10'>
                                        <div className='input-group'>
                                            <input type='text' className='form-control' placeholder='mm/dd/yyyy' id='dateFrom' />
                                            <div className='input-group-append'>
                                                <span className='input-group-text'><i className='md md-event-note'></i></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='col-xl-3 col-lg-5 col-md-5 col-sm-5 col-xs-10 col-10'>
                                <div className='form-group row'>
                                    <label className='col-md-2 col-2 col-form-label text-right'>To:</label>
                                    <div className='col-md-10 col-10'>
                                        <div className='input-group'>
                                            <input type='text' className='form-control' placeholder='mm/dd/yyyy' id='dateTo' />
                                            <div className='input-group-append'>
                                                <span className='input-group-text'><i className='md md-event-note'></i></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='col-xl-1 col-lg-2 col-md-2 col-xs-2 col-xs-2 col-2'>
                                <button className='btn btn-white waves-effect p-t-7 p-b-8' onClick={setNow}>Now</button>
                            </div>
                        </div>

                        <div className='bootstrap-table bootstrap-table-sortable'>
                            <SortableTable
                                data={logsDataArr}
                                columns={columns} />
                        </div>

                    </div>
                </div>
          </div>
        </div>
   );
}

export default asyncReactor(AsyncLogs, Loader);
