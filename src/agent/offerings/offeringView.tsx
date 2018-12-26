import * as React from 'react';
import { translate } from 'react-i18next';
import countryByIso from '../../utils/countryByIso';
import ProductNameByOffering from '../products/productNameByOffering';

@translate('offerings/createOffering')
export default class OfferingView extends React.Component<any, any>{

    constructor(props:any){
        super(props);
    }

    render(){

        const { t } = this.props;
        const props = this.props;

        return <div className='col-lg-9 col-md-8'>
            <div className='card m-b-20 card-body'>
                <div className='form-group row m-b-0'>
                    <label className='col-3 col-form-label'>{t('Server')}: </label>
                    <div className='col-9 col-form-label'>
                        {/*<LinkToProductByOfferingId offeringId={props.offering.id} >*/}
                            <ProductNameByOffering offeringId={props.offering.id} />
                        {/*</LinkToProductByOfferingId>*/}
                    </div>
                </div>
            </div>
            <div className='card m-b-20'>
                <h5 className='card-header'>{t('GeneralInfo')}</h5>
                <div className='card-body'>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('Name')}: </label>
                        <div className='col-9'>
                            <input type='text' className='form-control' value={props.offering.serviceName} readOnly/>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('Description')}: </label>
                        <div className='col-9'>
                            <input type='text' className='form-control' value={props.offering.description} readOnly/>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('Country')}: </label>
                        <div className='col-9'>
                            <input type='text' className='form-control' value={countryByIso(props.offering.country)} readOnly/>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('Supply')}: </label>
                        <div className='col-9'>
                            <input type='text' className='form-control' value={props.offering.supply} readOnly/>
                            <span className='help-block'>
                                <small>
                                    {t('MaximumSupplyOfServices')}
                                    {t('ItRepresentsTheMaximum')}
                                </small>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className='card m-b-20'>
                <h5 className='card-header'>{t('BillingInfo')}</h5>
                <div className='card-body'>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('UnitType')}:</label>
                        <div className='col-9'>
                            <select className='form-control' disabled>
                                <option value='Mb'>MB</option>
                            </select>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('PricePerMB')}:</label>
                        <div className='col-9'>
                            <div className='input-group bootstrap-touchspin'>
                                <input type='text' className='form-control' value={(props.offering.unitPrice/1e8).toFixed(8).replace(/0+$/,'')} readOnly/>
                                <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                            </div>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('MaxBillingUnitLag')}:</label>
                        <div className='col-9'>
                            <div className='input-group bootstrap-touchspin'>
                                <input type='text' className='form-control' value={props.offering.maxBillingUnitLag} readOnly/>
                                <span className='input-group-addon bootstrap-touchspin-postfix'>MB</span>
                            </div>
                            <span className='help-block'>
                                <small>{t('MaximumPaymentLagInUnits')}</small>
                            </span>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('MinUnits')}:</label>
                        <div className='col-9'>
                            <div className='input-group bootstrap-touchspin'>
                                <input type='text' className='form-control' value={props.offering.minUnits} readOnly/>
                                <span className='input-group-addon bootstrap-touchspin-postfix'>MB</span>
                            </div>
                            <span className='help-block'>
                                <small>{t('UsedToCalculateMinimumDeposit')}</small>
                            </span>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('MaxUnits')}:</label>
                        <div className='col-9'>
                            <div className='input-group bootstrap-touchspin'>
                                <input type='text' className='form-control' value={props.offering.maxUnit ? props.offering.maxUnit : t('unlimited')} readOnly/>
                                <span className='input-group-addon bootstrap-touchspin-postfix'>MB</span>
                            </div>
                            <span className='help-block'>
                                <small>{t('UsedToSpecifyMaximumUnits')}</small>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className='card m-b-20'>
                <h5 className='card-header'>{t('ConnectionInfo')}</h5>
                <div className='card-body'>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('MaxSuspendTime')}:</label>
                        <div className='col-9'>
                            <div className='input-group bootstrap-touchspin'>
                                <input type='text' className='form-control' value={Math.ceil(parseFloat(props.offering.maxSuspendTime) / 60)} readOnly/>
                                <span className='input-group-addon bootstrap-touchspin-postfix'>{t('min')}</span>
                            </div>
                            <span className='help-block'>
                                <small>
                                    {t('MaximumTimeServiceCan')}
                                    {t('AfterThisTimePeriodService')}
                                    {t('PeriodIsSpecifiedInMinutes')}
                                </small>
                            </span>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('MaxInactiveTime')}:</label>
                        <div className='col-9'>
                            <div className='input-group bootstrap-touchspin'>
                                <input type='text' className='form-control' value={Math.ceil(parseFloat(props.offering.maxInactiveTimeSec) / 60)} readOnly/>
                                <span className='input-group-addon bootstrap-touchspin-postfix'>min</span>
                            </div>
                            <span className='help-block'>
                                <small>
                                    {t('MaximumTimeWithoutServiceUsage')}
                                    {t('AgentWillConsider')}
                                    {t('PeriodIsSpecified')}
                                </small>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}
