import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Form from 'react-jsonschema-form';
import {ipcRenderer} from 'electron';
import {fetchFactory} from '../../fetch';

const fetch = fetchFactory(ipcRenderer);

export default function(props:any){

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

    return <Form schema={props.src.schema} uiSchema={props.src.uiSchema} onSubmit={onSubmit}>
        <div>
          <button type='submit'>Save Service Offering</button>
          <button type='button' onClick={onClick}>Cancel</button>
        </div>
    </Form>;
}
