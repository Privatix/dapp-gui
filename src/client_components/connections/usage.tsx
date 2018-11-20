import * as React from 'react';
import { translate } from 'react-i18next';

import { ClientChannelUsage } from 'typings/channels';

interface IProps {
    t?: any;
    usage: ClientChannelUsage;
}

@translate('client/connections/usage')
export default class Usage extends React.Component<IProps, any>{

    render(){

        const { usage, t } = this.props;

        return <span>{`${usage.current} ${t('of')} ${usage.maxUsage} ${usage.unit}`}</span>;
    }
}
