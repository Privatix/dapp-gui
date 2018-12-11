import * as React from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import notice from '../utils/notice';
import { translate } from 'react-i18next';

@translate(['copyToClipboard', 'utils/notice'])

export default class CopyToClipboardWrapper extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
    }

    render() {
        const { t } = this.props;

        return <CopyToClipboard text={this.props.text}
                 onCopy={() => {
                     notice({level: 'info', title: t('utils/notice:Congratulations!'), msg: t('Copied')});
                 }}
                >
            <button className='btn btn-link copyToClipboardBtn' title={t('Copy')}><i className='fa fa-clipboard'></i></button>
        </CopyToClipboard>;
    }

}
