import * as React from 'react';

interface IProps {
    levels: string[];
    level: string;
    btnColorClass: string;
    handleChangeLevel(evt: any): void;
}

function levelBtn(props: IProps) {
    return (
        <button className={'btn btn-' + props.btnColorClass + ' btn-rounded waves-effect waves-light w-xs' +
            (props.levels.length > 0 && props.levels.indexOf(props.level) === -1 ? ' btn-custom btn-custom-rounded' : '')}
            onClick={props.handleChangeLevel}
            data-level={props.level}
        >
            {props.level}
        </button>
    );
}

export default levelBtn;
