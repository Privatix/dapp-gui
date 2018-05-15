import * as React from 'react';

export default function(props:any) {
    let incomingStatus = props.contractStatus;
    let contractStatus;

    switch (incomingStatus) {
        case 'pending':
            contractStatus = 'primary';
            break;
        case 'active':
            contractStatus = 'success';
            break;
        case 'wait_coop':
            contractStatus = 'warning';
            break;
        case 'wait_challenge':
            contractStatus = 'warning';
            break;
        case 'closed_coop':
            contractStatus = 'inverse';
            break;
        case 'in_challenge':
            contractStatus = 'danger';
            break;
        case 'wait_uncoop':
            contractStatus = 'danger';
            break;
        case 'closed_uncoop':
            contractStatus = 'pink';
            break;
    }

    return <span className={'label label-table label-' + contractStatus}>{incomingStatus}</span>;
}
