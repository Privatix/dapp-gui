import * as React from 'react';
import { Link } from 'react-router-dom';
import { render } from 'react-dom';
import {fetch} from '../../utils/fetch';
import {asyncReactor} from 'async-reactor';
import TemplateItem from './templateItem';
import AddTemplate from './addTemplate';

function Loader() {

  return (<h2>Loading templates ...</h2>);

}

async function AsyncTemplates(props:any){

    const templates = await fetch('/templates', {method: 'GET'});
    const list = (templates as any).map(template => <li><TemplateItem template={template} /></li>);

    const onClick = function(evt:any){
        evt.preventDefault();
        evt.stopPropagation();
        render(<AddTemplate />, document.getElementById('template'));
    };

    return (
        <div>
        <section>
          <h3>templates list</h3>
          <ul>
            {list}
          </ul>
          <a href='' onClick={onClick}>+ Add template</a> | <Link to={'/'}>back</Link>
        </section>
        <hr />
        <div id='template'></div>
        </div>
   );
}

export default asyncReactor(AsyncTemplates, Loader);
