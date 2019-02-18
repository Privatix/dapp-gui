import * as React from 'react';
import { translate } from 'react-i18next';

import { ClientChannelUsage } from 'typings/channels';

import toFixedN from 'utils/toFixedN';

interface IProps {
    t?: any;
    usage: ClientChannelUsage;
    mode: string;
}

const translated = translate('client/connections/usage');

class Usage extends React.Component<IProps, {}>{


    render(){

        const { t, mode, usage } = this.props;

        if(!usage) {
            return null;
        }

        return mode === 'unit'
            ? (usage
                ? <span>{usage.current}&nbsp;{t('of')}&nbsp;{usage.maxUsage}&nbsp;{usage.unitName}</span>
                : <span></span>
              )
            : <span>{toFixedN({number: (usage.cost / 1e8), fixed: 8})}</span>;
    }
}

export default translated(Usage);
