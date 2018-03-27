import * as React from 'react';
import Form from 'react-jsonschema-form';
import { Link } from 'react-router-dom';
import {ipcRenderer} from 'electron';
import {fetchFactory} from '../fetch';
const fetch = fetchFactory(ipcRenderer);
import {asyncReactor} from 'async-reactor';

function Loader() {

  return (<h2>Loading settings ...</h2>);

}

async function AsyncSettings(props:any){

    return await fetch('/settings', {method: 'GET'}).then(options => {
        console.log('OPTIONS!!!', options);
        const schema = {
        'schema': {
          'title': 'edit settings',
          'type': 'object',
          'properties': {
          }
        },
        'uiSchema': {
        }
      };

        (options as any).forEach((option: any) => {
            schema.schema.properties[option.name] = {'type': 'string', 'default': option.value};
            schema.uiSchema[option.name] = {'ui:help': option.desc};
        });
        
        const onSubmit = ({formData}) => {
            const sendData = Object.keys(formData).map(key => { return {'name': key, 'value': formData[key]}; });
            fetch('/settings', {method: 'put', body: sendData}).then(res => {
                // ReactDOM.unmountComponentAtNode(document.getElementById('template'));
            });
        };
        return <div><Form schema={schema.schema} uiSchema={schema.uiSchema} onSubmit={onSubmit}>
            <div>
              <button type='submit'>save</button>
              <Link to={'/'}>Cancel</Link>
            </div>
        </Form></div>;
    });
}

export default asyncReactor(AsyncSettings, Loader);
