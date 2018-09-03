import * as React from 'react';
import * as moment from 'moment';

export default function (props: any) {
    if (props.time) {
        moment.locale(props.lang);

        const date = new Date(Date.parse(props.time));
        const formattedDate = moment(date).format('h:mm A DD-MMM-YY');

        return <span>{formattedDate}</span>;
    } else {
        return <span></span>;
    }
}
