import * as React from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { translate } from 'react-i18next';

import notice from 'utils/notice';

interface IProps {
    t?: any;
    className?: string;
    text: string;
}

@translate(['copyToClipboard', 'utils/notice'])
export default class CopyToClipboardWrapper extends React.Component<IProps, {}> {

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
