import * as React from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { translate } from 'react-i18next';

import notice from 'utils/notice';

@translate(['copyToClipboard', 'utils/notice'])
export default class CopyToClipboardWrapper extends React.Component<any, any> {

    onCopy = () => {

        const { t } = this.props;

        notice({level: 'info', header: t('utils/notice:Congratulations!'), msg: t('Copied')});

    }

    render() {

        const { t } = this.props;

        return (
            <CopyToClipboard text={this.props.text} onCopy={this.onCopy} >
                <button className='btn btn-link copyToClipboardBtn' title={t('Copy')}>
                    <i className='fa fa-clipboard'></i>
                </button>
            </CopyToClipboard>
        );
    }

}
