import * as React from 'react';
import toFixedN from '../../utils/toFixedN';
import { translate } from 'react-i18next';
import {connect} from 'react-redux';
import {State} from '../../typings/state';

@translate('client/acceptOffering')

class OfferingById extends React.Component<any, any>{

    constructor(props:any){
        super(props);

        this.state = {
            offering: Object
        };
    }

    async componentDidMount(){
        const offering = await this.props.ws.getOffering(this.props.offeringId);
        this.setState({offering});
    }

    render(){
        const {t} = this.props;
        const offering = this.state.offering;
        const offeringCountry = typeof offering.country !== 'undefined' ? offering.country : '';
        const offeringPrice = typeof offering.unitPrice !== 'undefined' ? toFixedN({number: (offering.unitPrice / 1e8), fixed: 8}) : '';
        const offeringMaxInactiveTimeSec = typeof offering.maxInactiveTimeSec !== 'undefined' ? offering.maxInactiveTimeSec : '';

        return <div className='col-lg-12 col-md-12'>
            <div className='card m-b-20'>
                <h5 className='card-header'>{t('VPNInfo')}</h5>
                <div className='card-body'>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('Country')}</label>
                        <div className='col-9'>
                            <input type='text' className='form-control' value={offeringCountry} readOnly/>
                        </div>
                    </div>
                </div>
            </div>

            <div className='card m-b-20'>
                <h5 className='card-header'>{t('BillingInfo')}</h5>
                <div className='card-body'>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('PricePerMB')}</label>
                        <div className='col-9'>
                            <div className='input-group bootstrap-touchspin'>
                                <input type='text' className='form-control' value={offeringPrice} readOnly/>
                                <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='card m-b-20'>
                <h5 className='card-header'>{t('ConnectionInfo')}</h5>
                <div className='card-body'>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('MaxInactiveTime')}</label>
                        <div className='col-9'>
                            <div className='input-group bootstrap-touchspin'>
                                <input type='text' className='form-control' value={offeringMaxInactiveTimeSec} readOnly/>
                                <span className='input-group-addon bootstrap-touchspin-postfix'>{t('sec')}</span>
                            </div>
                            <span className='help-block'>
                                <small>{t('MaxTimeWithoutServiceSmallText')}</small>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default connect( (state: State) => ({ws: state.ws}) )(OfferingById);
