import * as React from 'react';
// import { Link } from 'react-router-dom';
import {fetch} from 'utils/fetch';
import {asyncReactor} from 'async-reactor';
import SessionItem from './sessionItem';

function Loader() {

  return (<h2>Loading sessions ...</h2>);

}

async function AsyncSessions (props:any){

    let endpoint;

    if(props.channel){
        endpoint = '/sessions' + (props.channel === 'all' ? '' : `?channelId=${props.channel}`);
    }else{
        endpoint = '/sessions' + (props.match.params.channel === 'all' ? '' : `?channelId=${props.match.params.channel}`);
    }

    const sessions = await fetch(endpoint, {method: 'GET'});

    const sessionsDOM = (sessions as any).map((session: any) => <SessionItem session={session} />);
    /*
    return <div>
        <hr />
        {sessionsDOM}
        <hr />
        <Link to={'/'}>back</Link>
    </div>;
*/
    const exportToFile = function(){
        // 
    };

    return <div className='container-fluid'>

        <div className='row'>
            <div className='col-12'>
                <div className='card-box'>
                    <h3>Total Statistics</h3>
                    <table>
                        <tbody>
                            <tr><td>Total usage:</td><td>13 Gb</td></tr>
                            <tr><td>Total income:</td><td>82 PRIX</td></tr>
                            <tr><td>Session count:</td><td>123</td></tr>
                        </tbody>
                    </table>
                    <hr />
                    <h3>Detailed Statistics</h3><br />
                    <button onClick={exportToFile}>Export to a file</button><br />
                    <table className='table table-bordered table-striped'>
                        <thead>
                            <tr>
                            <td>Id</td><td>Started</td><td>Stopped</td><td>Usage</td><td>Last Usage Time</td><td>Client Ip</td>
                            </tr>
                        </thead>
                        <tbody>
                            {sessionsDOM}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>;
}

export default asyncReactor(AsyncSessions, Loader);
