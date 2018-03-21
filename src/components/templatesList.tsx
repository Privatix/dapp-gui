import * as React from 'react';
import { render } from 'react-dom';
import TemplateItem from './templateItem';
import AddTemplate from './addTemplate';

export default function(props:any){

    const templates = props.list.map(template => <li><TemplateItem template={template} /></li>);

    const onClick = function(evt:any){
        evt.preventDefault();
        evt.stopPropagation();
        render(<AddTemplate src={props.template} />, document.getElementById('template'));
    };

    return (
        <section>
          <h3>templates list</h3>
          <ul>
            {templates}
          </ul>
          <a href='' onClick={onClick}>+ Add template</a>
        </section>
   );
}
