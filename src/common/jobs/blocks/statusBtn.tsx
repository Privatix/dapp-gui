import * as React from 'react';

interface IProps {
    statuses: string[];
    status: string;
    btnColorClass: string;
    handleChangeStatus(evt: any): void;
}

function statusBtn(props: IProps) {
    return (
        <button className={'btn btn-' + props.btnColorClass + ' btn-rounded waves-effect waves-light w-xs' +
            (props.statuses.length > 0 && props.statuses.indexOf(props.status) === -1 ? ' btn-custom btn-custom-rounded' : '')}
            onClick={props.handleChangeStatus}
            data-status={props.status}
        >
            {props.status}
        </button>
    );
}

export default statusBtn;
