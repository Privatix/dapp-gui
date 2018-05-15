import * as React from 'react';

export default function(props:any) {
    let incomingStatus = props.serviceStatus;
    let serviceStatus;

    switch (incomingStatus) {
        case 'pending':
            serviceStatus = 'primary';
            break;
        case 'active':
            serviceStatus = 'success';
            break;
        case 'suspended':
            serviceStatus = 'warning';
            break;
        case 'terminated':
            serviceStatus = 'inverse';
            break;
    }

    return <span className={'label label-table label-' + serviceStatus}>{incomingStatus}</span>;
}
