import * as React from 'react';
import {fetch} from '../../utils/fetch';
import { connect } from 'react-redux';
import {asyncProviders} from '../../redux/actions';
import {State} from '../../typings/state';
import { translate } from 'react-i18next';

@translate('channels/channelView')

class AgentAccessInfo extends React.Component <any, any> {

    constructor(props:any) {
        super(props);

        this.state = {
            'offering': null,
            'product': null
        };

        this.getData();
    }

    async getData() {
        const offerings = await fetch(`/offerings?id=${this.props.channel.offering}`);
        if ((offerings as any).length === 0) {
            return;
        }

        const offering = (offerings as any)[0];

        this.props.dispatch(asyncProviders.updateProducts());
        const product = (this.props.products as any).filter((product: any) => product.id === offering.product)[0];

        this.setState({offering, product});
    }

    render() {
        const { t } = this.props;

        if (!this.state.offering || !this.state.product) {
            return <div></div>;
        }

        return <div className='table-responsive'>
            <table className='table table-striped'>
                <tbody>
                <tr>
                    <td>{t('Country')}</td>
                    <td><img src={`images/country/${this.state.offering.country.toLowerCase()}.png`} width='30px'/></td>
                </tr>
                <tr>
                    <td>{t('Hostname')}</td>
                    <td>{this.state.product.serviceEndpointAddress ? this.state.product.serviceEndpointAddress : ''}</td>
                </tr>
                </tbody>
            </table>
        </div>;
    }
}

export default connect( (state: State) =>
    ({products: state.products})
)(AgentAccessInfo);
