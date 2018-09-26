import * as React from 'react';
// import {fetch} from '../../utils/fetch';
import ChannelsListByStatus from '../channels/channelsListByStatus';
import OfferingsList from '../offerings/offeringsList';
import toFixedN from '../../utils/toFixedN';
import * as api from '../../utils/api';
import { translate } from 'react-i18next';

@translate('agent/dashboard')

export default class Main extends React.Component <any,any> {

    constructor(props:any) {
        super(props);

        this.state = {
            income: 0,
            refresh: null
        };
    }

    componentDidMount() {
        this.refresh();
    }

    registerRefresh(refresh:Function) {
        this.setState({refresh});
    }

    async refresh() {
        const channels = await api.channels.getList();

        const income = (channels as any).reduce((income, channel) => {
            if (Object.keys(channel).length === 0) {
                return income;
            }
            return income + channel.receiptBalance;
        }, 0);

        if ('function' === typeof this.state.refresh) {
            this.state.refresh();
        }

        this.setState({income});
    }

    render() {
        const { t } = this.props;
        return <div className='container-fluid'>
            <div className='row'>
                <div className='col-sm-12 m-b-20'>
                    <h3 className='page-title'>{t('TotalIncome')} {toFixedN({number: (this.state.income / 1e8), fixed: 8})} PRIX</h3>
                </div>
            </div>
            <div className='row'>
                <div className='col-sm-12 m-b-15'>
                    <div className='m-t-15'>
                        <button onClick={this.refresh.bind(this)}
                              className='btn btn-default btn-custom waves-effect waves-light'>{t('RefreshAllBtn')}</button>
                    </div>
                </div>
            </div>
            <div className='row'>
                <div className='col-sm-12'>
                    <div className='card m-b-20'>
                        <h5 className='card-header'>{t('ActiveServices')}</h5>
                        <div className='card-body'>
                            <ChannelsListByStatus status={'active'} registerRefresh={this.registerRefresh.bind(this)}/>
                        </div>
                    </div>
                    <div className='card m-b-20'>
                        <h5 className='card-header'>{t('ActiveOfferings')}</h5>
                        <div className='card-body'>
                            <OfferingsList product={'all'} rate={3000}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}
