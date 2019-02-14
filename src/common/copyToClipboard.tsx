import * as React from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { translate } from 'react-i18next';

import notice from 'utils/notice';

interface IProps {
    t?: any;
    text: string;
}

interface IState {

}

@translate(['copyToClipboard', 'utils/notice'])
export default class CopyToClipboardWrapper extends React.Component<IProps, IState> {

    onCopy = () => {

        const { t } = this.props;

        notice({level: 'info', header: t('utils/notice:Congratulations!'), msg: t('Copied')});

    }

    render() {

        const { t, text } = this.props;

        return (
            <CopyToClipboard text={text} onCopy={this.onCopy} >
                <button className='btn btn-link copyToClipboardBtn' title={t('Copy')}>
                    <i className='fa fa-clipboard'></i>
                </button>
            </CopyToClipboard>
        );
    }

}
