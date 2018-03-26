import * as React from 'react';
import {ipcRenderer} from 'electron';
import {fetchFactory} from '../fetch';
const fetch = fetchFactory(ipcRenderer);

export default function(props:any){
    const handler = (evt: any) => {
        const options = props.options;
        fetch(props.endpoint, options);
        evt.preventDefault();
    };
    const a = <a href='#' onClick={handler}>{props.title}</a>;
    return a;
}
