import * as React from 'react';
import { Link } from 'react-router-dom';
import {ipcRenderer} from 'electron';
import {fetchFactory} from '../../fetch';
const fetch = fetchFactory(ipcRenderer);
import {asyncReactor} from 'async-reactor';
import SessionItem from './sessionItem';

function Loader() {

  return (<h2>Loading sessions ...</h2>);

}

async function AsyncSessions (props:any){

    const sessions = await fetch('/sessions', {method: 'GET'});

    const title = 
        props.match.params.channel === 'all'
        ? <h3>offerings list for all channels</h3>
        : <h3>offerings list for channel: {props.match.params.channel}</h3>;
    const sessionsDOM = (sessions as any).map((session: any) => <SessionItem session={session} />);
    return <div>
        {title}
        <hr />
        {sessionsDOM}
        <hr />
        <Link to={'/'}>back</Link>
    </div>;
}

export default asyncReactor(AsyncSessions, Loader);
