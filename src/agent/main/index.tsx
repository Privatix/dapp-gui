import * as React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import ChannelsListByStatus from 'agent/channels/channelsListByStatus';
import Offerings from 'agent/offerings/';
import Prix from 'common/badges/PRIX';
import ProductsList from 'agent/products/productsList';

import { State } from 'typings/state';

const translate = withTranslation('agent/dashboard');

class Main extends React.Component <any,any> {

    render() {

        const { t, totalIncome } = this.props;


        return <div className='container-fluid'>
            <div className='row'>
                <div className='col-sm-12 m-b-20'>
                    <h3 className='page-title'>{t('TotalIncome')} <Prix amount={totalIncome} /> PRIX</h3>
                </div>
            </div>
            <div className='row'>
                <div className='col-sm-12'>
                    <ProductsList />
                    <div className='card m-b-20'>
                        <h5 className='card-header'>{t('ActiveOfferings')}</h5>
                        <div className='card-body'>
                            <Offerings product={'all'} statuses={['registering', 'registered', 'popping_up', 'popped_up', 'removing']} onlyTable={true}/>
                        </div>
                    </div>
                    <div className='card m-b-20'>
                        <h5 className='card-header'>{t('ActiveServices')}</h5>
                        <div className='card-body'>
                            <ChannelsListByStatus status={'active'} />
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default connect((state: State) => ({totalIncome: state.totalIncome}))(translate(Main));
