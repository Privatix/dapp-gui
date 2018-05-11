import * as React from 'react';

export default function(props:any){
    // console.log(new Date(Date.parse(props.time)));
    const date = new Date(Date.parse(props.time));
    const months = [
    'Jan', 'Feb', 'Mar',
    'Apr', 'May', 'Jun', 'Jul',
    'Aug', 'Sep', 'Oct',
    'Nov', 'Dec'
  ];
    const strDate = `${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    return <span>{strDate}</span>;
}
