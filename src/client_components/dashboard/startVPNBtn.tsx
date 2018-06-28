import * as React from 'react';
import { withRouter } from 'react-router-dom';

export default function(props:any){

    const StartVPNButton = withRouter(
        ({ history }) => <button type='button'
                                 className='btn btn-default btn-custom btn-lg w-lg waves-effect waves-light'
                                 onClick={async (evt: any) => {
                                     evt.preventDefault();
                                     history.push(`/client-vpn-list`);
                                 }}>
            Start using VPN
        </button>
    );

    return <div className='container-fluid'>
        <div className='row'>
            <div className='col-sm-12 m-t-20'>
                <StartVPNButton />
            </div>
        </div>
    </div>;
}
