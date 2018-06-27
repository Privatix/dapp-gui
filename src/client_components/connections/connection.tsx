import * as React from 'react';
import AcceptOffering from '../vpn_list/acceptOffering';
import SortableTable from 'react-sortable-table-vilan';
import ConfirmPopupSwal from '../../components/confirmPopupSwal';
import * as dateformat from 'dateformat';
import ServiceStatus from './serviceStatus';
import ContractStatus from '../../components/channels/contractStatus';
import AccessInfo from '../../components/endpoints/accessInfo';
import * as api  from '../../utils/api';

export default class Connection extends React.Component<any, any>{

    async renderOffering(){
        const offerings = await api.getClientOfferings();
        const offering = offerings.filter(offering => offering.id === this.props.connection.offering)[0];
        this.props.render('Offering', <AcceptOffering offering={offering} mode='view' />);
    }

    render(){

        const sessionsColumns = [
            {
                header: 'Id',
                key: 'id'
            },
            {
                header: 'Agent',
                key: 'agent'
            },
            {
                header: 'Server',
                key: 'server'
            },
            {
                header: 'Offering',
                key: 'offering'
            },
            {
                header: 'Started',
                key: 'started'
            },
            {
                header: 'Stopped',
                key: 'stopped'
            },
            {
                header: 'Usage',
                key: 'usage'
            },
            {
                header: 'Cost (PRIX)',
                key: 'cost'
            },
            {
                header: 'Last Usage time',
                key: 'lastUsageTime'
            },
            {
                header: 'Client IP',
                key: 'clientIP'
            }
        ];
        const sessionsData = [];

        return <div>
            <div className='row'>
                <div className='col-8'>
                    <div className='card m-b-20'>
                        <h5 className='card-header'>Common Info</h5>
                        <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                            <div className='card-body'>
                                <table className='table table-bordered table-striped'>
                                    <tbody>
                                        <tr>
                                            <td>Id:</td>
                                            <td>{this.props.connection.id}</td>
                                        </tr>
                                        <tr>
                                            <td>Offering:</td>
                                            <td>
                                                <a href='#'
                                                   onClick={this.renderOffering.bind(this)}
                                                   className='btn btn-link waves-effect'>
                                                       {this.props.connection.offering}
                                                </a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Contract status:</td>
                                            <td><ContractStatus contractStatus={this.props.connection.channelStatus.channelStatus} /></td>
                                        </tr>
                                        <tr>
                                            <td>Service status:</td>
                                            <td><ServiceStatus status={this.props.connection.channelStatus.channelStatus} /></td>
                                        </tr>
                                        <tr>
                                            <td>Transferred:</td>
                                            <td>{this.props.connection.usage.current} {this.props.connection.usage.unit}</td>
                                        </tr>
                                        <tr>
                                            <td>Cost:</td>
                                            <td>{(this.props.connection.usage.cost/1e8).toFixed(4)} PRIX</td>
                                        </tr>
                                        <tr>
                                            <td>Deposit:</td>
                                            <td>{(this.props.connection.deposit/1e8).toFixed(4)} PRIX</td>
                                        </tr>
                                        <tr>
                                            <td>Last usage time:</td>
                                            <td>{dateformat(new Date(Date.parse(this.props.connection.channelStatus.lastChanged)), 'mmm d yyyy hh:MM:ss')}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className='card m-b-20'>
                        <h5 className='card-header'>Access info</h5>
                        <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                            <div className='card-body'>
                               <AccessInfo channel={this.props.connection} />
                            </div>
                        </div>
                    </div>
                </div>


                <div className='col-4'>
                    <div className='card m-b-20 card-body text-xs-center'>
                        <form>
                            <p className='card-text'>This operation will pause VPN usage.</p>
                            <p className='card-text'>For this contract, max suspend time is {Math.floor(this.props.connection.channelStatus.maxInactiveTime/60)} min</p>
                            <button className='btn btn-primary btn-custom btn-block'>Pause</button>
                        </form>
                    </div>
                    <div className='card m-b-20 card-body text-xs-center'>
                        <form>
                            <p className='card-text'>This operation will permanently finish VPN usage.</p>
                            <p className='card-text'>Your remaining deposit will be returned approx. in 12 min.</p>
                            <ConfirmPopupSwal
                                endpoint={`/client/channels/${this.props.connection.id}/status`}
                                options={{method: 'put', body: {action: 'terminate'}}}
                                title={'Finish'}
                                text={<span>This operation will permanently finish VPN usage.<br />
                                    Your remaining deposit will be returned approx. in 12 min.</span>}
                                class={'btn btn-primary btn-custom btn-block'}
                                swalType='warning'
                                swalConfirmBtnText='Yes, finish it!'
                                swalTitle='Are you sure?' />
                        </form>
                    </div>
                    <div className='card m-b-20 card-body text-xs-center warningAreaCard'>
                        <form>
                            <h5 className='card-title'>Warning Area</h5>
                            <p className='card-text'>This operation will terminate the service and call the "Uncooperative close" procedure</p>
                            <ConfirmPopupSwal
                                endpoint={`/client/channels/${this.props.connection.id}/status`}
                                options={{method: 'put', body: {action: 'terminate'}}}
                                title={'Terminate contract'}
                                text={<span>This operation will terminate the service and call the "Uncooperative close" procedure</span>}
                                class={'btn btn-danger btn-custom btn-block'}
                                swalType='danger'
                                swalConfirmBtnText='Yes, terminate contract!'
                                swalTitle='Are you sure?' />
                        </form>
                    </div>
                </div>
            </div>

            <div className='row m-t-30'>
                <div className='col-12'>
                    <div className='card m-b-20'>
                        <h5 className='card-header'>Sessions</h5>
                        <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                            <div className='card-body'>
                                <div className='bootstrap-table bootstrap-table-sortable'>
                                    <SortableTable
                                        data={sessionsData}
                                        columns={sessionsColumns}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}
