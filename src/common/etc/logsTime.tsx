import * as React from 'react';
import moment from 'moment';

interface IProps {
    time?: string;
    lang: string;
}

export default function (props: IProps) {
    if (props.time) {
        moment.locale(props.lang);

        const date = new Date(Date.parse(props.time));
        const formattedDate = moment(date).format('h:mm A DD-MMM-YY');

        return <span>{formattedDate}</span>;
    } else {
        return null;
    }
}
