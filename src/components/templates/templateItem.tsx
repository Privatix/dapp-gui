import * as React from 'react';
import Template from './template';
import { render } from 'react-dom';

export default function(props:any){

    const templateSrc = atob(props.template.raw);
    const template = JSON.parse(templateSrc);

    const handler = function(evt:any){
        evt.preventDefault();
        evt.stopPropagation();
        render(<Template src={template} id={props.template.id} kind={props.template.kind} />, document.getElementById('template'));
    };

    const elem = <a href='' onClick={handler}>{template.schema.title} | {props.template.kind}</a>;
    return elem;
}
