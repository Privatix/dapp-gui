import * as React from 'react';
import {fetch} from '../../utils/fetch';

class ClientAccessInfo extends React.Component <any, any> {

    constructor(props:any) {
        super(props);

        this.state = {
            'endpoint': []
        };

        this.getData();
    }

    async getData() {
        const endpoint = await fetch(`/endpoints?ch_id=${this.props.channel.id}`);

        this.setState({endpoint});
    }

    render() {
        if (!this.state.endpoint || !this.state.endpoint[0]) {
            return <div></div>;
        }

        const accessInfo = this.state.endpoint[0];

        return <div className='card m-b-20'>
            <h5 className='card-header'>Access info</h5>
            <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                <div className='card-body'>
                    <div className='table-responsive'>
                        <table className='table table-striped'>
                            <tbody>
                            <tr>
                                <td>Service address:</td>
                                <td>{accessInfo.serviceEndpointAddress}</td>
                            </tr>
                            <tr>
                                <td>Payment address:</td>
                                <td>{accessInfo.paymentReceiverAddress}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default ClientAccessInfo;
