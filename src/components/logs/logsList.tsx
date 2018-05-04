import * as React from 'react';
// import { Link } from 'react-router-dom';
import {fetch} from 'utils/fetch';
import {asyncReactor} from 'async-reactor';
import LogItem from './logItem';


function Loader() {

  return (<h2>Loading logs ...</h2>);

}

async function AsyncLogs(props:any){

    const endpoint = '/logs';
    const logs = await fetch(endpoint, {method: 'GET'});
    const list = (logs as any).map((log:any) => <LogItem log={log} /> );

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

    return (
        <div className='container-fluid'>
        <div className='row'>
            <div className='col-sm-12 m-b-15'>
                <h3 className='page-title'>logs list</h3>
            </div>
        </div>
            <div className='row'>
                <div className='col-12'>
                    <div className='card-box'>
                        <button onClick={exportToFile} >Export to a file</button><br />
                        <input type='search' value='search' /><br />
                        <button onClick={selectInfo}>Info</button> <button onClick={selectWarnings}>warning</button> <button onClick={selectErrors}>error</button>
                        <label>From: <input id='dateFrom' type='date' /></label> <label>To: <input id='dateTo' type='date' /></label><button onClick={setNow}>now</button>
                        <table className='table table-bordered table-striped'>
                            <thead>
                                <tr>
                                <td>Severity</td><td>Date</td><td>Event</td>
                                </tr>
                            </thead>
                            <tbody>
                                {list}
                            </tbody>
                        </table>
                    </div>
                </div>
          </div>
        </div>
   );
}

export default asyncReactor(AsyncLogs, Loader);
