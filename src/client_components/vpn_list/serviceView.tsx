import * as React from 'react';
import {fetch} from '../../utils/fetch';
import PgTime from '../../components/utils/pgTime';
import ContractStatus from '../../components/channels/contractStatus';
import ChannelStatus from '../../components/channels/channelStatusStyle';
import ClientAccessInfo from '../endpoints/clientAccessInfo';
import { withRouter } from 'react-router-dom';
import TerminateContractButton from '../connections/terminateContractButton';
import notice from '../../utils/notice';

class ServiceView extends React.Component <any,any> {

    constructor(props:any) {
        super(props);

        this.state = {
            service: props.service,
            sessions: [],
            getSessions: false
        };
    }

    static getDerivedStateFromProps(props:any, state:any) {
        let getSessions = false;
        if (props.visible) {
            getSessions = true;
        }

        return {
            service: props.service,
            sessions: [],
            getSessions
        };
    }

    getSessions() {
        const service = this.state.service;
        fetch(`/sessions?channelId=${service.id}`, {}).then(async (sessionsRaw) => {
            const offerings = await fetch(`/offerings?id=${service.offering}`, {});

            if (Object.keys(offerings).length === 0) {
                return false;
            }

            const offering = (offerings as any)[0];

            const products = await fetch(`/products`, {});

            const product = (products as any).filter((product: any) => product.id === offering.product)[0];

            const sessions = (sessionsRaw as any).map((session) => {
                return {
                    id: session.channel,
                    agent: this.state.service.agent,
                    server: product.name,
                    offering: this.state.service.offering,
                    started: session.started,
                    stopped: session.stopped,
                    usage: session.unitsUsed,
                    cost: this.state.service.usage.cost / 1e8,
                    lastUsageTime: session.lastUsageTime,
                    clientIP: session.clientIP
                };
            });

            this.setState({sessions});
        });
    }

    async componentDidMount(){
        if (this.state.getSessions) {
            this.getSessions();
            this.setState({getSessions: false});
        }
    }

    render() {

        const service = this.state.service;
/*
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
                key: 'started',
                render: (started) => <PgTime time={started} />,
                descSortFunction: DateSorter.desc,
                ascSortFunction: DateSorter.asc
            },
            {
                header: 'Stopped',
                key: 'stopped',
                render: (stopped) => <PgTime time={stopped} />,
                descSortFunction: DateSorter.desc,
                ascSortFunction: DateSorter.asc
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
                key: 'lastUsageTime',
                render: (lastUsageTime) => <PgTime time={lastUsageTime} />,
                descSortFunction: DateSorter.desc,
                ascSortFunction: DateSorter.asc
            },
            {
                header: 'Client IP',
                key: 'clientIP',
                sortable: false
            }
        ];
*/
        return <div>
            <div className='row'>
                <div className={service.channelStatus.channelStatus === 'active' ? 'col-8' : 'col-12'}>
                    <div className='card m-b-20'>
                        <h5 className='card-header'>Common Info</h5>
                        <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                            <div className='card-body'>
                                <table className='table table-bordered table-striped'>
                                    <tbody>
                                    <tr>
                                        <td className='width30'>Id:</td>
                                        <td>{service.id}</td>
                                    </tr>
                                    <tr>
                                        <td>Offering:</td>
                                        <td>{service.offering}</td>
                                    </tr>
                                    <tr>
                                        <td>Contract status:</td>
                                        <td><ContractStatus contractStatus={service.channelStatus.channelStatus}/></td>
                                    </tr>
                                    <tr>
                                        <td>Service status:</td>
                                        <td><ChannelStatus serviceStatus={service.channelStatus.serviceStatus}/></td>
                                    </tr>
                                    <tr>
                                        <td>Transferred:</td>
                                        <td>{service.usage.current} {service.usage.unit}</td>
                                    </tr>
                                    <tr>
                                        <td>Cost:</td>
                                        <td>{service.usage.cost / 1e8}</td>
                                    </tr>
                                    <tr>
                                        <td>Deposit:</td>
                                        <td>{service.deposit / 1e8} PRIX</td>
                                    </tr>
                                    <tr>
                                        <td>Last usage time:</td>
                                        <td><PgTime time={service.channelStatus.lastChanged}/></td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <ClientAccessInfo channel={this.state.service} />

                </div>
                <div className={service.channelStatus.channelStatus === 'active' ? 'col-4' : 'hidden'}>
                    <TerminateContractButton
                        status={service.channelStatus.serviceStatus !== 'terminated' ? 'disabled' : 'active'}
                        channelId={service.id}
                        done={() => {
                            notice({
                                level: 'info',
                                msg: 'The contract has been terminated'
                            });
                            this.props.history.push('/client-dashboard-start');
                        }}
                    />
                </div>
            </div>
            { /*
            <div className='row m-t-30'>
                <div className='col-12'>
                    <div className='card m-b-20'>
                        <h5 className='card-header'>Sessions</h5>
                        <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                            <div className='card-body'>
                                <div className='bootstrap-table bootstrap-table-sortable'>
                                    <SortableTable
                                        data={this.state.sessions}
                                        columns={sessionsColumns}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
           */ }
        </div>;
    }
}

export default withRouter(ServiceView);
