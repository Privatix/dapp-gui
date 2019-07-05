import * as React from 'react';

import i18n from 'i18next/init';
import ConfirmPopupSwal from 'common/confirmPopupSwal';

export default function externalLink(props: any) {

    const shell = require('electron').shell;
    const { href, className, text, children } = props;

    const openExternalLink = () => {
        shell.openExternal(href);
    };

    return <ConfirmPopupSwal
            isExternalLink={true}
            done={openExternalLink}
            title={text || children}
            text={<span>{i18n.t('externalLinks/warning:warning')}</span>}
            className={className}
            swalType='warning'
            swalConfirmBtnText={i18n.t('externalLinks/warning:confirmBtn')}
            swalTitle={i18n.t('externalLinks/warning:AreYouSure')} />;
}
