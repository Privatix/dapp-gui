import * as React from 'react';
import {fetch} from '../utils/fetch';
import {asyncReactor} from 'async-reactor';
import { withRouter } from 'react-router-dom';
import SettingsTable from './settingsTable';

function Loader() {

  return (<h2>Loading settings ...</h2>);

}

async function AsyncSettings(props:any){

    const settings = await fetch('/settings', {method: 'GET'});

    return <SettingsTable options={settings} />;

}

export default withRouter(asyncReactor(AsyncSettings, Loader));
