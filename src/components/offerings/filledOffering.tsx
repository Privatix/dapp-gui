import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Form from 'react-jsonschema-form';
import {ipcRenderer} from 'electron';
import {fetchFactory} from '../../fetch';
const fetch = fetchFactory(ipcRenderer);
import {asyncReactor} from 'async-reactor';

function Loader() {

  return (<h2>Loading offerings template ...</h2>);

}

async function AsyncFilledOffering(props:any){

    const offering = JSON.parse(props.match.params.offering);
    const endpoint = `/templates?id=${offering.templateId}`;
    const res = await fetch(endpoint, {method: 'GET'});
    const template = res[0];
    console.log('TEMPLATE!!!', template);
    Object.keys(offering).forEach((key:string) => {
        (template as any).schema.properties[key].default = offering[key];
    });
    console.log('TEMPLATE!!!', template);
    const onSubmit = ({formData}) => {
        // console.log('Data submitted: ',  formData);
        fetch('/offerings', {method: 'post', body: {offering: formData}}).then(res => {
            ReactDOM.unmountComponentAtNode(document.getElementById('template'));
            document.getElementById('template').innerHTML = 'offer saved!!!';
        });
    };

    const onClick = () => {
        ReactDOM.unmountComponentAtNode(document.getElementById('template'));
    };

    return <Form schema={(template as any).schema} uiSchema={(template as any).uiSchema} onSubmit={onSubmit}>
              <button type='submit'>Save Service Offering</button>
              <button type='button' onClick={onClick}>Cancel</button>
        </Form>;
}

export default asyncReactor(AsyncFilledOffering, Loader);
