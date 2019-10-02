import * as React from 'react';
import { translate } from 'react-i18next';
import ChannelsListByStatus from './channelsListByStatus';

@translate(['channels/channelsByStatus', 'common'])
export default class ChannelsByStatus extends React.Component <any,any> {

    constructor(props: any) {
        super(props);

        this.state = {
            status: props.status,
        };
    }

    static getDerivedStateFromProps(props:any) {
        return {status: props.status};
    }

    render() {

        const status = this.state.status;
        const { t } = this.props;

        return <div className='container-fluid'>
            <div className='row'>
                <div className='col-sm-12 m-b-15'>
                    <h3 className='page-title'>{status === 'active' ? t('ActiveServices') : t('History')}</h3>
                </div>
            </div>
            <ChannelsListByStatus status={status} />
        </div>;
    }
}
