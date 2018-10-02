import * as React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import countries from '../../utils/countries';
import Select from 'react-select';

import notice from '../../utils/notice';
import {asyncProviders} from '../../redux/actions';
import { Product } from '../../typings/products';
import { State } from '../../typings/state';
import * as api from '../../utils/api';

interface Props {
    product: Product;
    dispatch: any;
    t?: any;
}

@translate(['products/productView', 'utils/notice', 'common'])
class ProductView extends React.Component <Props,any> {

    constructor(props:Props) {
        super(props);

        this.state = {
            product: props.product,
            host: props.product.serviceEndpointAddress,
            country: props.product.country
        };
    }

    handleHostChange(evt:any) {
        this.setState({host: evt.target.value});
    }

    async saveHost(evt:any) {

        evt.preventDefault();

        const { t } = this.props;

        if ( (/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(this.state.host)) // IP
            || (/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/.test(this.state.host)) ) /* DNS */ {

            const product = Object.assign({}, this.state.product, {serviceEndpointAddress: this.state.host, country: this.state.country});

            api.products.saveProduct(product).then((result:any) => {
                if (result.id === this.state.product.id) {
                    notice({level: 'info', title: t('utils/notice:Congratulations!'), msg: t('HostWasSuccessfullyUpdated')});
                    this.props.dispatch(asyncProviders.updateProducts());
                } else {
                    notice({level: 'error', title: t('utils/notice:Attention!'), msg: t('SomethingWentWrong')});
                }
            });
        } else {
            notice({level: 'error', title: t('utils.notice/Attention!'), msg: t('PleaseInsertIPorDNS')});
        }
    }

    handleCountryChange(selectedCountry: any) {
        this.setState({country: selectedCountry.value});
    }

    render() {

        const { t } = this.props;
        const product = this.state.product;

        const selectCountry = <Select className='zIndex100'
            value={this.state.country.toUpperCase()}
            searchable={false}
            clearable={false}
            options={countries.map((country:any) => ({value: country.id, label: country.name}))}
            onChange={this.handleCountryChange.bind(this)}
            placeholder={t('common:Select')} />;

        return <div>
            <form onSubmit={this.saveHost.bind(this)}>
                <table className='table table-striped'>
                    <tbody>
                    <tr>
                        <td className='width30'>{t('Name')}:</td>
                        <td>{product.name}</td>
                    </tr>
                    <tr>
                        <td>{t('Host')}:</td>
                        <td><input type='text' className='form-control'
                               value={this.state.host} onChange={this.handleHostChange.bind(this)} /></td>
                    </tr>
                    <tr>
                        <td>{t('Country')}:</td>
                        <td>
                            {selectCountry}
                        </td>
                    </tr>
                    </tbody>
                </table>
                <button type='submit' className='btn btn-default btn-custom btn-block waves-effect waves-light m-t-15 m-b-20'>{t('Save')}</button>
            </form>
        </div>;
    }
}

export default connect( (state: State, onProps: Props) => {
    return (onProps);
} )(withRouter(ProductView));
