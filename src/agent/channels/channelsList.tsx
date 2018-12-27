import * as React from 'react';
import { translate } from 'react-i18next';

import ChannelsListByStatus from './channelsListByStatus';

@translate(['channels/channelsList', 'common'])
class ChannelsList extends React.Component<any, any> {

    render() {

        const { t } = this.props;

        return (
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-sm-12 m-b-15'>
                        <h3 className='page-title'>{t('AllServices')}</h3>
                    </div>
                </div>
                <ChannelsListByStatus />
            </div>
        );
    }

}

export default ChannelsList;
