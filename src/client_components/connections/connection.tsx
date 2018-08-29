import * as React from 'react';
import { withRouter } from 'react-router-dom';
import SortableTable from 'react-sortable-table-vilan';
import * as dateformat from 'dateformat';
import ChannelStatus from '../../components/channels/channelStatusStyle';
import ContractStatus from '../../components/channels/contractStatus';
import ClientAccessInfo from '../endpoints/clientAccessInfo';
import toFixed8 from '../../utils/toFixed8';
import * as api from '../../utils/api';
import Offering from '../vpn_list/acceptOffering';
import TerminateContractButton from './terminateContractButton';
import FinishServiceButton from './finishServiceButton';

class Connection extends React.Component<any, any>{

    constructor(props:any) {
        super(props);
        this.state = {
            channel: props.connection,
            offering: null
        };

        this.updateOffering(props.connection.offering);
    }

    static getDerivedStateFromProps(props:any, state:any) {
        return {channel: props.connection};
    }

    updateOffering(offeringId: string){
        api.getClientOfferingById(offeringId)
           .then(offering => {
               if(offering){
                   this.setState({offering});
               }
           });
    }

    showOffering(evt:any){
        evt.preventDefault();
        this.props.render('Offering', <Offering mode='view' offering={this.state.offering} />);
    }

    render(){

        if(this.state.offering && this.props.connection.offering !== this.state.offering.id){
            this.updateOffering(this.props.connection.offering);
        }

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

        const lastUsageTime = this.state.channel.channelStatus.lastChanged;
        const isValidLastUsageTime = (lastUsageTime !== '' && typeof(lastUsageTime) !== 'undefined' && lastUsageTime !== null);

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
                                            <td>{this.state.channel.id}</td>
                                        </tr>
                                        <tr>
                                            <td>Offering:</td>
                                            <td>{this.state.offering
                                                ? <a href='#' onClick={this.showOffering.bind(this)}>
                                                    { new Buffer(this.state.offering.hash, 'base64').toString('hex') }
                                                  </a>
                                                : ''}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Contract status:</td>
                                            <td><ContractStatus contractStatus={this.state.channel.channelStatus.channelStatus} /></td>
                                        </tr>
                                        <tr>
                                            <td>Service status:</td>
                                            <td><ChannelStatus serviceStatus={this.state.channel.channelStatus.serviceStatus} /></td>
                                        </tr>
                                        <tr>
                                            <td>Transferred:</td>
                                            <td>{this.state.channel.usage.current} {this.state.channel.usage.unit}</td>
                                        </tr>
                                        <tr>
                                            <td>Cost:</td>
                                            <td>{toFixed8({number: (this.state.channel.usage.cost / 1e8)})} PRIX</td>
                                        </tr>
                                        <tr>
                                            <td>Deposit:</td>
                                            <td>{toFixed8({number: (this.state.channel.deposit / 1e8)})} PRIX</td>
                                        </tr>
                                        <tr>
                                            <td>Last usage time:</td>
                                            <td>{ isValidLastUsageTime ? dateformat(new Date(Date.parse(lastUsageTime)), 'mmm d yyyy hh:MM:ss') : ''}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <ClientAccessInfo channel={this.state.channel} />
                </div>


                <div className='col-4'>
                    <FinishServiceButton channel={this.state.channel} />
                    <TerminateContractButton
                        status='disabled'
                        channelId={this.state.channel.id}
                        done={() => this.props.history.push('/client-history')}
                    />
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

export default withRouter(Connection);
