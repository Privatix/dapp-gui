import * as React from 'react';
import {fetch} from 'utils/fetch';

export default function(props:any){
    const handler = (evt: any) => {
        const options = props.options;
        fetch(props.endpoint, options);
        evt.preventDefault();
    };
    return <button onClick={handler} className={props.class}>{props.title}</button>;
}
