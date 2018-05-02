import * as React from 'react';
import {fetch} from 'utils/fetch';

export default function(props:any){
    const handler = (evt: any) => {
        const options = props.options;
        fetch(props.endpoint, options);
        evt.preventDefault();
    };
    const a = <button onClick={handler}>{props.title}</button>;
    return a;
}
