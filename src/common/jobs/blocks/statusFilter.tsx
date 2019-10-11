import * as React from 'react';
import StatusBtn from './statusBtn';

interface IProps {
    statuses: string[];
    handleChangeStatus(evt: any): void;
}

function statusesFilter(props: IProps) {
    const { statuses } = props;
    return (
        <div className='col-xl-5 col-lg-12 col-md-12 col-sm-12 col-xs-12 button-list m-b-10 logsLevelFilterBl'>
            <StatusBtn statuses={statuses} status='active' btnColorClass='primary' handleChangeStatus={props.handleChangeStatus} />
            <StatusBtn statuses={statuses} status='done' btnColorClass='success' handleChangeStatus={props.handleChangeStatus} />
            <StatusBtn statuses={statuses} status='failed' btnColorClass='pink' handleChangeStatus={props.handleChangeStatus} />
            <StatusBtn statuses={statuses} status='canceled' btnColorClass='warning' handleChangeStatus={props.handleChangeStatus} />
        </div>
    );
}

export default statusesFilter;
