import * as React from 'react';

export default function (props: any) {
    // console.log(new Date(Date.parse(props.time)));
    const date = new Date(Date.parse(props.time));
    const dateformat = require('dateformat');
    const formattedDate = dateformat(date, 'mmm d yyyy hh:MM:ss');

    return <span>{formattedDate}</span>;
}
