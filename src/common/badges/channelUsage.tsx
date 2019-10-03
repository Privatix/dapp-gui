import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import { ClientChannelUsage } from 'typings/channels';

import Prix from './PRIX';
import MB from './MB';

interface IProps extends WithTranslation {
    usage: ClientChannelUsage;
    mode: string;
}

const translate = withTranslation('client/connections/usage');

class Usage extends React.Component<IProps, {}>{


    render(){

        const { t, mode, usage } = this.props;

        if(!usage) {
            return null;
        }

        return mode === 'unit'
            ? (usage
                ? (usage.unitName === 'MB'
                       ? <span><MB amount={usage.current} />&nbsp;{t('of')}&nbsp;<MB amount={usage.maxUsage} /></span>
                       : <span>{usage.current}&nbsp;{t('of')}&nbsp;{usage.maxUsage}&nbsp;{usage.unitName}</span>
                  )
                : null
              )
            : <span><Prix amount={usage.cost} /></span>;
    }
}

export default translate(Usage);
