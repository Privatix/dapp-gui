import * as React from 'react';
import { connect } from 'react-redux';

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

        const { ws } = this.props;

        const offering = await ws.getOffering(this.props.channel.offering);

        if (!offering) {
            return;
        }

        const product = await ws.getProduct(offering.product);

        this.setState({offering, product});
    }

    render() {

        const { t } = this.props;
        const { offering, product } = this.state;

        if (!offering || !product) {
            return <div></div>;
        }

        return <div className='table-responsive'>
            <table className='table table-striped'>
                <tbody>
                <tr>
                    <td>{t('Country')}</td>
                    <td><img src={`images/country/${offering.country.toLowerCase()}.png`} width='30px'/></td>
                </tr>
                <tr>
                    <td>{t('Hostname')}</td>
                    <td>{product.serviceEndpointAddress ? product.serviceEndpointAddress : ''}</td>
                </tr>
                </tbody>
            </table>
        </div>;
    }
}

export default connect( (state: State) =>
    ({ws: state.ws})
)(AgentAccessInfo);
