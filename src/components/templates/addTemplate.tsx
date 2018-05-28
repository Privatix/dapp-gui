import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {fetch} from '../../utils/fetch';

export default function(props:any){

    const onSubmit = (evt:any) => {
        evt.preventDefault();
        evt.stopPropagation();
        // console.log('Data submitted: ',  evt.target);
        const body = {
            raw: btoa((document.getElementById('templateSrc') as HTMLInputElement).value),
            kind: (document.getElementById('templateType') as HTMLInputElement).value
        };
        fetch('/templates', {method: 'post', body}).then(res => {
            ReactDOM.unmountComponentAtNode(document.getElementById('template'));
            document.getElementById('template').innerHTML = 'template added!!!';
        });
    };

    const onUpload = (evt:any) => {
        evt.preventDefault();
        evt.stopPropagation();
        console.log((document.getElementById('templateFile') as any).files[0].path);
        const body = {
            path: (document.getElementById('templateFile') as any).files[0].path,
            kind: (document.getElementById('templateFromFileType') as HTMLInputElement).value
        };
        fetch('/templates', {method: 'post', body}).then(res => {
            ReactDOM.unmountComponentAtNode(document.getElementById('template'));
            document.getElementById('template').innerHTML = 'template added!!!';
        });
    };

    const onClick = () => {
        ReactDOM.unmountComponentAtNode(document.getElementById('template'));
    };

    return <div>
        <hr />
        <form action='' id='addTemplate'>
          <select id='templateType'>
            <option value='offer'>offer</option>
            <option value='access'>access</option>
          </select>
            <textarea name='template' id='templateSrc' cols={40} rows={5}></textarea><br/>
          <button type='button' onClick={onSubmit}>add template</button>
          <button type='button' onClick={onClick}>cancel</button>
        </form>
        <hr />
        <form action='#' id='uploadTemplate'>
          <select id='templateFromFileType'>
            <option value='offer'>offer</option>
            <option value='access'>access</option>
          </select>
          <label>Load from file <input id='templateFile' name='templateFile' type='file' /></label>
          <button type='button' onClick={onUpload}>upload</button>
        </form>
        <hr />
    </div>;
}
