import * as React from 'react';
import Template from './template';
import { render } from 'react-dom';

export default function(props:any){
    const handler = function(evt:any){
        evt.preventDefault();
        evt.stopPropagation();
        render(<Template src={props.template} />, document.getElementById('template'));
    };
    const elem = <a href='' onClick={handler}>{props.template.schema.title}</a>;
    return (elem);
}
