import * as React from 'react';
import LevelBtn from './levelBtn';

interface IProps {
    levels: string[];
    handleChangeLevel(evt: any): void;
}

function levelsFilter(props: IProps) {
    return (
        <div className='col-xl-5 col-lg-12 col-md-12 col-sm-12 col-xs-12 button-list m-b-10 logsLevelFilterBl'>
            <LevelBtn levels={props.levels} level='debug' btnColorClass='primary' handleChangeLevel={props.handleChangeLevel} />
            <LevelBtn levels={props.levels} level='info' btnColorClass='success' handleChangeLevel={props.handleChangeLevel} />
            <LevelBtn levels={props.levels} level='warning' btnColorClass='warning' handleChangeLevel={props.handleChangeLevel} />
            <LevelBtn levels={props.levels} level='error' btnColorClass='pink' handleChangeLevel={props.handleChangeLevel} />
            <LevelBtn levels={props.levels} level='fatal' btnColorClass='danger' handleChangeLevel={props.handleChangeLevel} />
        </div>
    );
}

export default levelsFilter;
