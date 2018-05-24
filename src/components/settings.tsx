import * as React from 'react';
import {fetch} from 'utils/fetch';
import {asyncReactor} from 'async-reactor';
import { withRouter } from 'react-router-dom';
import SettingsTable from './settingsTable';

function Loader() {

  return (<h2>Loading settings ...</h2>);

}

async function AsyncSettings(props:any){

    const settings = await fetch('/settings', {method: 'GET'});
/*
        const optionsDOM = (options as any).map(option => <tr>
                                        <td>{option.name}:</td>
                                        <td>
                                            <div className='form-control text-right'>
                                                <input id={option.key} type='text' defaultValue={option.value} data-desc={option.description} data-name={option.name}/>
                                                <label htmlFor={option.key} className='m-b-15'></label>
                                            </div>
                                        </td>
                                        <td>{option.description}</td>
                                    </tr>);

  const columns = [{
    Header: 'Name',
    accessor: 'name' // String-based value accessors!
  }, {
    Header: 'Val',
    accessor: 'value',
    Cell: props => <div className='form-control text-right'>
                        <input id={props.key} type='text' defaultValue={props.value} data-desc={props.description} data-name={props.name}/>
                        <label htmlFor={props.key} className='m-b-15'></label>
                    </div>
  }, {
    Header: 'desc',
    accessor: 'description' // Custom value accessors!
  }];
 */
        return <SettingsTable options={settings} />;
}

export default withRouter(asyncReactor(AsyncSettings, Loader));
