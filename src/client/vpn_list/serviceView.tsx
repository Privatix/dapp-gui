import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import PgTime from 'common/etc/pgTime';
import ContractStatus from 'common/badges/contractStatus';
import ChannelStatus from 'common/badges/channelStatus';
import ClientAccessInfo from 'client/endpoints/clientAccessInfo';
import TerminateContractButton from 'client/connections/terminateContractButton';

import notice from 'utils/notice';

// import { Product } from 'typings/products';
import { State } from 'typings/state';

@translate(['client/serviceView', 'utils/notice'])

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

    async getSessions() {
        /*
        const { ws } = this.props;
        const service = this.state.service;
        const sessionsRaw = await ws.getSessions(service.id);
        const offering = await ws.getOffering(service.offering);

        if (!offering) {
            return false;
        }

        const products = await ws.getProducts();

        const product = products.filter((product: Product) => product.id === offering.product)[0];

        const sessions = sessionsRaw.map((session) => {
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
       */
    }

    async componentDidMount(){
        if (this.state.getSessions) {
            this.getSessions();
            this.setState({getSessions: false});
        }
    }

    render() {

        const service = this.state.service;
        const { t } = this.props;
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
                        <h5 className='card-header'>{t('CommonInfo')}</h5>
                        <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                            <div className='card-body'>
                                <table className='table table-bordered table-striped'>
                                    <tbody>
                                    <tr>
                                        <td className='width30'>{t('IdTd')}</td>
                                        <td>{service.id}</td>
                                    </tr>
                                    <tr>
                                        <td>{t('Offering')}</td>
                                        <td>{service.offering}</td>
                                    </tr>
                                    <tr>
                                        <td>{t('ContractStatusTd')}</td>
                                        <td><ContractStatus contractStatus={service.channelStatus.channelStatus}/></td>
                                    </tr>
                                    <tr>
                                        <td>{t('ServiceStatusTd')}</td>
                                        <td><ChannelStatus serviceStatus={service.channelStatus.serviceStatus}/></td>
                                    </tr>
                                    <tr>
                                        <td>{t('Transferred')}</td>
                                        <td>{service.usage.current} {service.usage.unit}</td>
                                    </tr>
                                    <tr>
                                        <td>{t('Cost')}</td>
                                        <td>{service.usage.cost / 1e8}</td>
                                    </tr>
                                    <tr>
                                        <td>{t('Deposit')}</td>
                                        <td>{service.deposit / 1e8} PRIX</td>
                                    </tr>
                                    <tr>
                                        <td>{t('LastUsageTime')}</td>
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
                        payment={service.usage.cost}
                        channelId={service.id}
                        done={() => {
                            notice({
                                level: 'info',
                                msg: t('ContractHasBeenTerminated')
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

export default connect( (state: State, onProps: any) => Object.assign({}, {ws: state.ws}, onProps))(withRouter(ServiceView));
