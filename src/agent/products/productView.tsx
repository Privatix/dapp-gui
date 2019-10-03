import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { WithTranslation, withTranslation } from 'react-i18next';
import Select from 'react-select';

import countries from 'utils/countries';
import notice from 'utils/notice';
import { ws, WS } from 'utils/ws';

import { Product } from 'typings/products';

type IProps = RouteComponentProps<{}> & {
    product: Product;
    dispatch: any;
    ws?: WS;
} & WithTranslation;

interface IState {
    product: Product;
    host: string;
    country: string;
}

const translate = withTranslation(['products/productView', 'utils/notice', 'common']);

class ProductView extends React.Component <IProps, IState> {

    constructor(props:IProps) {
        super(props);

        this.state = {
            product: props.product,
            host: props.product.serviceEndpointAddress,
            country: props.product.country ? props.product.country : ''
        };
    }

    handleHostChange = (evt: any) => {
        this.setState({host: evt.target.value});
    }

    saveHost = async (evt: React.SyntheticEvent<EventTarget>) => {

        evt.preventDefault();

        const { t, ws } = this.props;

        if ( (/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(this.state.host)) // IP
            || (/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/.test(this.state.host)) ) /* DNS */ {

            const product = Object.assign({}, this.state.product, {serviceEndpointAddress: this.state.host, country: this.state.country});

            try {
                await ws.updateProduct(product);
                notice({level: 'info', header: t('utils/notice:Congratulations!'), msg: t('HostWasSuccessfullyUpdated')});
            } catch (err) {
                notice({level: 'error', header: t('utils/notice:Attention!'), msg: t('SomethingWentWrong')});
            }
        } else {
            notice({level: 'error', header: t('utils.notice/Attention!'), msg: t('PleaseInsertIPorDNS')});
        }
    }

    handleCountryChange = (selectedCountry: any) => {
        this.setState({country: selectedCountry.value});
    }

    render() {

        const { t } = this.props;
        const { product, country, host } = this.state;

        const selectCountry = <Select className='zIndex100'
            value={country.toUpperCase()}
            searchable={false}
            clearable={false}
            options={countries.map((country:any) => ({value: country.id, label: country.name}))}
            onChange={this.handleCountryChange}
            placeholder={t('common:Select')}
            />;

        return <div>
            <form onSubmit={this.saveHost}>
                <table className='table table-striped'>
                    <tbody>
                    <tr>
                        <td className='width30'>{t('Name')}:</td>
                        <td>{product.name}</td>
                    </tr>
                    <tr>
                        <td>{t('Host')}:</td>
                        <td>
                            <input type='text'
                                   className='form-control'
                                   value={host}
                                   onChange={this.handleHostChange}
                            />
                        </td>
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

export default withRouter(ws<IProps>(translate(ProductView)));
