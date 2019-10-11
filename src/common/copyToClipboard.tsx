import * as React from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { WithTranslation, withTranslation } from 'react-i18next';

import notice from 'utils/notice';

interface IProps extends WithTranslation {
    className?: string;
    text: string;
}

const translate = withTranslation(['copyToClipboard', 'utils/notice']);

class CopyToClipboardWrapper extends React.Component<IProps, {}> {

    onCopy = () => {

        const { t } = this.props;

        notice({level: 'info', header: t('utils/notice:Congratulations!'), msg: t('Copied')});

    }

    render() {

        const { t, text, className } = this.props;

        return (
            <CopyToClipboard text={text} onCopy={this.onCopy} >
                <button className={`btn btn-link copyToClipboardBtn ${className} fa fa-clipboard`} title={t('Copy')}></button>
            </CopyToClipboard>
        );
    }

}

export default translate(CopyToClipboardWrapper);
