import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import ChannelsListByStatus from 'agent/channels/channelsListByStatus';
import Offerings from 'agent/offerings/';
import toFixedN from 'utils/toFixedN';

import { State } from 'typings/state';

@translate('agent/dashboard')

class Main extends React.Component <any,any> {

    constructor(props:any) {
        super(props);

        this.state = { income: '' };
    }

    componentDidMount() {
        this.refresh();
    }


    refresh() {
        this.getTotalIncome();
    }

    async getTotalIncome() {

        const { ws } = this.props;

        const totalIncome = await ws.getTotalIncome();
        const income = toFixedN({number: (totalIncome / 1e8), fixed: 8});
        this.setState({income});
    }

    render() {

        const { t } = this.props;
        const { income } = this.state;

        return <div className='container-fluid'>
            <div className='row'>
                <div className='col-sm-12 m-b-20'>
                    <h3 className='page-title'>{t('TotalIncome')} {income} PRIX</h3>
                </div>
            </div>
            <div className='row'>
                <div className='col-sm-12'>
                    <div className='card m-b-20'>
                        <h5 className='card-header'>{t('ActiveServices')}</h5>
                        <div className='card-body'>
                            <ChannelsListByStatus status={'active'} />
                        </div>
                    </div>
                    <div className='card m-b-20'>
                        <h5 className='card-header'>{t('ActiveOfferings')}</h5>
                        <div className='card-body'>
                            <Offerings product={'all'} statuses={['registering', 'registered', 'popping_up', 'popped_up', 'removing']} onlyTable={true}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default connect((state: State) => ({ws: state.ws}))(Main);
