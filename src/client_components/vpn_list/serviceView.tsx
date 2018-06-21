import * as React from 'react';
import {fetch} from '../../utils/fetch';
import SortableTable from 'react-sortable-table-vilan';
import PgTime from '../../components/utils/pgTime';
import ContractStatus from '../../components/channels/contractStatus';
import ChannelStatus from '../../components/channels/channelStatusStyle';
import DateSorter from '../../components/utils/sorters/sortingDate';
import AccessInfo from '../../components/endpoints/accessInfo';

export default class ServiceView extends React.Component <any,any> {

    constructor(props:any) {
        super(props);

        this.state = {
            service: props.service,
            sessions: []
        };
    }

    static getDerivedStateFromProps(props:any, state:any) {
        return {
            service: props.service,
            sessions: []
        };
    }

    getSessions() {
        const service = this.state.service;
        fetch(`/sessions?channelId=${service.id}`, {}).then(async (sessionsRaw) => {
            const offerings = await fetch(`/offerings?id=${service.offering}`, {});
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

    render() {
        const service = this.state.service;
        this.getSessions();

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

        return <div>
            <div className='row'>
                <div className='col-12'>
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

                    <div className='card m-b-20'>
                        <h5 className='card-header'>Access info</h5>
                        <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                            <div className='card-body'>
                                <AccessInfo channel={this.state.service} />
                            </div>
                        </div>
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
                                        data={this.state.sessions}
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
