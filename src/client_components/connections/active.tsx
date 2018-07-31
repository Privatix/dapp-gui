import * as React from 'react';
import ModalWindow from '../../components/modalWindow';
import Connection from './connection';
import ContractStatus from '../../components/channels/contractStatus';
import ChannelStatus from '../../components/channels/channelStatusStyle';
import JobStatus from './jobStatus';
import JobName from './jobName';
import Usage from './usage';
import { withRouter } from 'react-router-dom';
import toFixed8 from '../../utils/toFixed8';

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

        const connections = this.state.channels.map((channel: any) => {

            const jobTimeRaw = new Date(Date.parse(channel.job.createdAt));
            const jobTime = jobTimeRaw.getHours() + ':' + (jobTimeRaw.getMinutes() < 10 ? '0' : '') + jobTimeRaw.getMinutes();
            const jobStatus = <JobStatus status={channel.job.status} />;

            return <tr key={channel.id} >
                        <td>
                            <ModalWindow visible={this.state.popup}
                                         customClass='btn btn-link waves-effect'
                                         modalTitle='Connection' text={channel.id} component={<Connection connection={channel} />}
                            />
                        </td>
                        <td>{channel.agent}</td>
                        <td><ContractStatus contractStatus={channel.channelStatus.channelStatus}/></td>
                        <td><ChannelStatus serviceStatus={channel.channelStatus.serviceStatus}/></td>
                        <td><JobName jobtype={channel.job.jobtype} /> ({jobStatus} {jobTime})</td>
                        <td><Usage channel={channel} /></td>
                        <td>{toFixed8({number: (channel.usage.cost / 1e8)})}</td>
                    </tr>;
        });

        return <div className='row'>
            <div className='col-12'>
                <div className='card m-b-20'>
                    <h5 className='card-header'>Active Connection:</h5>
                    <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                        <div className='card-body'>
                            <table className='table table-bordered table-striped'>
                                <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Agent</th>
                                    <th>Contract status</th>
                                    <th>Service status</th>
                                    <th>Job status</th>
                                    <th>Usage</th>
                                    <th>Cost (PRIX)</th>
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
