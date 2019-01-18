import * as React from 'react';
import { translate } from 'react-i18next';

const translated = translate('logs/logsList');

interface IProps {
    t?: any;
    exportToFile(evt:any): void;
}

function exportBtns(props: IProps) {
    const { t } = props;

    return (
        <div>
            <button className='btn btn-default btn-custom waves-effect waves-light m-b-30'
                onClick={props.exportToFile}>{t('ExportControllerLogsBtn')}</button>
        </div>
    );
}

export default translated(exportBtns);
