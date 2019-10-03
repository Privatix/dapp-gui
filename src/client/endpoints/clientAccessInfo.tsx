import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import { WS, ws } from 'utils/ws';
import { ClientChannel } from 'typings/channels';
import { Endpoint } from 'typings/endpoints';

interface IProps extends WithTranslation {
    ws?: WS;
    channel: ClientChannel;
}

interface IState {
    endpoint: Endpoint;
}

class ClientAccessInfo extends React.Component <IProps, IState> {

    constructor(props:IProps) {
        super(props);

        this.state = {
            endpoint: null
        };

        this.getData();
    }

    async getData() {

        const { ws, channel } = this.props;

        const endpoint = await ws.getEndpoints(channel.id);
        if(endpoint.length){
            this.setState({endpoint: endpoint[0]});
        }
    }

    render() {

        const { t } = this.props;
        const { endpoint } = this.state;

        if (!endpoint) {
            return null;
        }

        return <div className='card m-b-20'>
            <h5 className='card-header'>{t('AccessInfo')}</h5>
            <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                <div className='card-body'>
                    <div className='table-responsive'>
                        <table className='table table-striped'>
                            <tbody>
                            <tr>
                                <td>{t('ServiceAddress')}</td>
                                <td>{endpoint.serviceEndpointAddress}</td>
                            </tr>
                            <tr>
                                <td>{t('PaymentAddress')}</td>
                                <td>{endpoint.paymentReceiverAddress}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default ws<IProps>(withTranslation('client/clientAccessInfo')(ClientAccessInfo));
