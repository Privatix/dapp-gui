import * as React from 'react';
import { translate } from 'react-i18next';

const translated = translate('logs/logsList');

function ExportLogsBtns(props: any) {
    const { t } = props;

    return (
        <div>
            <button className='btn btn-default btn-custom waves-effect waves-light m-b-30'
                    onClick={props.exportToFile}>{t('ExportControllerLogsBtn')}</button>
        </div>
    );
}

export default translated(ExportLogsBtns);
