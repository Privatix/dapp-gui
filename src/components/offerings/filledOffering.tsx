import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import Form from 'react-jsonschema-form';
import {fetch} from '../../utils/fetch';
import {asyncReactor} from 'async-reactor';
import * as uuid from 'uuid/v4';

function Loader() {

  return (<h2>Loading offerings template ...</h2>);

}

async function AsyncFilledOffering(props:any){

    const offering = JSON.parse(props.match.params.offering);
    const endpoint = `/templates?id=${offering.template}`;
    const res = await fetch(endpoint, {method: 'GET'});
    const template = res[0];
    template.raw = JSON.parse(atob(template.raw));

    Object.keys(offering).forEach((key:string) => {
        if(key in (template as any).raw.schema.properties){
            (template as any).raw.schema.properties[key].default = offering[key];
        }
    });

    const onSubmit = ({formData}) => {

        formData.id = uuid();
        formData.template = template.id;

        fetch('/offerings/', {method: 'post', body: formData}).then(res => {
            ReactDOM.unmountComponentAtNode(document.getElementById('template'));
            document.getElementById('template').innerHTML = 'offer saved!!!';
        });
    };

    return <Form schema={(template as any).raw.schema} uiSchema={(template as any).raw.uiSchema} onSubmit={onSubmit}>
              <button type='submit'>Save Service Offering</button>
              <Link to={'/'}>Cancel</Link>
        </Form>;
}

export default asyncReactor(AsyncFilledOffering, Loader);
