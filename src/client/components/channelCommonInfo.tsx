import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { WithTranslation, withTranslation } from 'react-i18next';

import PgTime from 'common/etc/pgTime';
import ContractStatus from 'common/badges/contractStatus';
import ChannelStatus from 'common/badges/channelStatus';
import Usage from 'common/badges/channelUsage';
import OfferingView from 'client/vpn_list/acceptOffering';

import prix from 'utils/prix';

import { State } from 'typings/state';
import { ClientChannel } from 'typings/channels';
import { Offering } from 'typings/offerings';

interface IProps extends WithTranslation {
    channel: ClientChannel;
    ws?: State['ws'];
    history?: any;
    render: any;
}

interface IState {
    offering: Offering;
}

class ServiceView extends React.Component <IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            offering: null
        };
    }

    async componentDidMount(){

        const { ws, channel } = this.props;

        const offering = await ws.getOffering(channel.offering);
        this.setState({offering});
    }

    showOffering = (evt:any) => {

        const { t, render } = this.props;
        const { offering } = this.state;

        evt.preventDefault();
        render(t('Offering'), <OfferingView mode='view' offering={offering} />);
    }

    render() {

        const { t, channel } = this.props;
        const { offering } = this.state;

        channel.usage.cost = channel.usage.cost || 0;
        channel.totalDeposit = channel.totalDeposit || 0;

        return (
            <div className='card m-b-20'>
                <h5 className='card-header'>{t('CommonInfo')}</h5>
                <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                    <div className='card-body'>
                        <table className='table table-bordered table-striped'>
                            <tbody>
                            <tr>
                                <td className='width30'>{t('IdTd')}</td>
                                <td>{channel.id}</td>
                            </tr>
                            <tr>
                                <td>{t('Offering')}</td>
                                <td>{offering
                                    ? <a href='#' onClick={this.showOffering} className='shortOfferingHash'>
                                        {`0x${offering.hash}`}
                                      </a>
                                    : null}
                                </td>
                            </tr>
                            <tr>
                                <td>{t('ContractStatusTd')}</td>
                                <td><ContractStatus contractStatus={channel.channelStatus.channelStatus}/></td>
                            </tr>
                            <tr>
                                <td>{t('ServiceStatusTd')}</td>
                                <td><ChannelStatus serviceStatus={channel.channelStatus.serviceStatus}/></td>
                            </tr>
                            <tr>
                                <td>{t('Transferred')}</td>
                                <td><Usage mode='unit' usage={channel.usage} /></td>
                            </tr>
                            <tr>
                                <td>{t('Cost')}</td>
                                <td>{prix(channel.usage.cost)} PRIX</td>
                            </tr>
                            <tr>
                                <td>{t('Deposit')}</td>
                                <td>{prix(channel.totalDeposit)} PRIX</td>
                            </tr>
                            <tr>
                                <td>{t('LastUsageTime')}</td>
                                <td><PgTime time={channel.channelStatus.lastChanged}/></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect( (state: State, ownProps: any) => Object.assign({}, {ws: state.ws}, ownProps))
              (withRouter(withTranslation(['client/serviceView', 'utils/notice'])(ServiceView)));
