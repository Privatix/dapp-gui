import * as React from 'react';

export default function(props:any){
    // console.log(new Date(Date.parse(props.time)));
    const date = new Date(Date.parse(props.time));
    return <span>{date.toString()}</span>;
}
