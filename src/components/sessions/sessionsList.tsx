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
    const usage = (sessions as any).reduce((usage, session) => {return usage + session.unitsUsed;}, 0);
    const income = await (sessions as any).reduce(async (income, session) => {
        const channels = await fetch(`/channels?id=${session.channel}`, {method: 'GET'});
        const offerings = await fetch(`/offerings?id=${channels[0].offering}`, {method: 'GET'});
        const price = offerings[0].unitPrice;
        return income + session.unitsUsed*price;
    }, 0);
    console.log('INCOME!!!', income);
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
            <div className='col-sm-12 col-xs-12'>
                <div className='card m-b-20'>
                    <h5 className='card-header'>Total Statistics</h5>
                    <div className='col-md-4 col-sm-12 col-xs-12 p-0'>
                        <div className='card-body'>
                            <table className='table table-striped'>
                                <tbody>
                                <tr><td>Total usage:</td><td>{(usage/1000).toFixed(3)} Gb</td></tr>
                                <tr><td>Total income:</td><td>{income} PRIX</td></tr>
                                <tr><td>Session count:</td><td>{(sessions as any).length}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className='row'>
            <div className='col-12'>
                <div className='card m-b-20'>
                    <h5 className='card-header'>Detailed Statistics</h5>
                    <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                        <div className='card-body'>
                            <button className='btn btn-default btn-custom waves-effect waves-light m-b-20' onClick={exportToFile}>Export to a file</button>
                            <table className='table table-bordered table-striped'>
                                <thead>
                                <tr>
                                    <th>Id</th><th>Started</th><th>Stopped</th><th>Usage</th><th>Last Usage Time</th><th>Client Ip</th>
                                </tr>
                                </thead>
                                <tbody>
                                {sessionsDOM}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>;
}

export default asyncReactor(AsyncSessions, Loader);
