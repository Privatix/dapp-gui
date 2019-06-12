import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';

import ChannelCommonInfo from 'client/components/channelCommonInfo';
import ClientAccessInfo from 'client/endpoints/clientAccessInfo';
import TerminateContractButton from 'client/connections/terminateContractButton';

import notice from 'utils/notice';

import { ClientChannel } from 'typings/channels';
import { Offering } from 'typings/offerings';

interface IProps {
    service: ClientChannel;
    t?: any;
    history: any;
    render: any;
}

interface IState {
    offering: Offering;
}

@translate(['client/serviceView', 'utils/notice'])
class ServiceView extends React.Component <IProps, IState> {

    render() {

        const { t, history, service, render } = this.props;

        return <>
            <div className='row'>
                <div className={service.channelStatus.channelStatus === 'active' ? 'col-8' : 'col-12'}>
                    <ChannelCommonInfo channel={service}  render={render} />
                    <ClientAccessInfo channel={service} />
                </div>
                <div className={service.channelStatus.channelStatus === 'active' ? 'col-4' : 'hidden'}>
                    <TerminateContractButton
                        status={service.channelStatus.serviceStatus !== 'terminated' ? 'disabled' : 'active'}
                        payment={service.usage.cost}
                        channelId={service.id}
                        done={() => {
                            notice({
                                level: 'info',
                                msg: t('ContractHasBeenTerminated')
                            });
                            history.push('/client-dashboard-start');
                        }}
                    />
                </div>
            </div>
        </>;
    }
}

export default withRouter(ServiceView);
