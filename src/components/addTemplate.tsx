import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {ipcRenderer} from 'electron';
import {fetchFactory} from '../fetch';

const fetch = fetchFactory(ipcRenderer);

export default function(props:any){

    const onSubmit = (evt:any) => {
        evt.preventDefault();
        evt.stopPropagation();
        // console.log('Data submitted: ',  evt.target);

        fetch('/addTemplate', {method: 'post', body: {templateSrc: (document.getElementById('templateSrc') as HTMLInputElement).value}}).then(res => {
            ReactDOM.unmountComponentAtNode(document.getElementById('template'));
            document.getElementById('template').innerHTML = 'template added!!!';
        });
    };

    const onClick = () => {
        ReactDOM.unmountComponentAtNode(document.getElementById('template'));
    };

    return <form action='' id='addTemplate'>
      <textarea name='template' id='templateSrc' cols='40' rows='5'></textarea><br/>
      <button type='button' onClick={onSubmit}>add template</button>
      <button type='button' onClick={onClick}>cancel</button>
    </form>;
}
