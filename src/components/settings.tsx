import * as React from 'react';
import {asyncReactor} from 'async-reactor';
import { withRouter } from 'react-router-dom';
import SettingsTable from './settingsTable';
import * as api from '../utils/api';

function Loader() {

  return (<h2>Loading settings ...</h2>);

}

async function AsyncSettings(props:any){

    const settings = await api.settings.get();

    return <SettingsTable options={settings} />;

}

export default withRouter(asyncReactor(AsyncSettings, Loader));
