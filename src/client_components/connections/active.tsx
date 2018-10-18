import * as React from 'react';
import ModalWindow from '../../components/modalWindow';
import Connection from './connection';
import ContractStatus from '../../components/channels/contractStatus';
import ChannelStatus from '../../components/channels/channelStatusStyle';
import JobStatus from './jobStatus';
import JobName from './jobName';
import Usage from './usage';
import { withRouter } from 'react-router-dom';
import toFixedN from '../../utils/toFixedN';
import { translate } from 'react-i18next';
import CopyToClipboard from '../../components/copyToClipboard';

@translate('client/connections/active')

class ActiveConnection extends React.Component<any, any>{

    constructor(props: any){
        super(props);
        this.state = {
            popup: false,
            channels: props.channels
        };
    }

    static getDerivedStateFromProps(props:any, state:any) {
        return {channels: props.channels};
    }

    render() {
        const { t } = this.props;

        const connections = this.state.channels.map((channel: any) => {

            const jobTimeRaw = new Date(Date.parse(channel.job.createdAt));
            const jobTime = jobTimeRaw.getHours() + ':' + (jobTimeRaw.getMinutes() < 10 ? '0' : '') + jobTimeRaw.getMinutes();
            const jobStatus = <JobStatus status={channel.job.status} />;

            return <tr key={channel.id} >
                <td className='shortTableTextTd'>
                    <ModalWindow
                        visible={this.state.popup}
                        customClass='shortTableText'
                        modalTitle={t('Connection')}
                        text={channel.id}
                        copyToClipboard={true}
                        component={<Connection connection={channel}
                        />}
                    />
                </td>
                <td className='shortTableTextTd'>
                    <div>
                        <span className='shortTableText' title={channel.agent}>{channel.agent}</span>
                        <CopyToClipboard text={channel.agent} />
                    </div>
                </td>
                <td><ContractStatus contractStatus={channel.channelStatus.channelStatus}/></td>
                <td><ChannelStatus serviceStatus={channel.channelStatus.serviceStatus}/></td>
                <td><JobName jobtype={channel.job.jobtype} /> ({jobStatus} {jobTime})</td>
                <td><Usage channel={channel} /></td>
                <td>{toFixedN({number: (channel.usage.cost / 1e8), fixed: 8})}</td>
            </tr>;
        });

        return <div className='row'>
            <div className='col-12'>
                <div className='card m-b-20'>
                    <h5 className='card-header'>{t('ActiveConnection')}</h5>
                    <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                        <div className='card-body'>
                            <table className='table table-bordered table-striped table-responsive'>
                                <thead>
                                <tr>
                                    <th>{t('Id')}</th>
                                    <th>{t('Agent')}</th>
                                    <th>{t('ContractStatus')}</th>
                                    <th>{t('ServiceStatus')}</th>
                                    <th>{t('JobStatus')}</th>
                                    <th>{t('Usage')}</th>
                                    <th>{t('CostPRIX')}</th>
                                </tr>
                                </thead>
                                <tbody>
                                { connections }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default withRouter(ActiveConnection);
