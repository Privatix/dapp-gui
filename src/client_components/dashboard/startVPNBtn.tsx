import * as React from 'react';
import { withRouter } from 'react-router-dom';
import {asyncReactor} from 'async-reactor';

function Loader() {
    return (<h2>Loading data ...</h2>);
}

async function AsyncDashboardStart (props:any){

    const StartVPNButton = withRouter(
        ({ history }) => <button type='button'
                                 className='btn btn-default btn-custom btn-lg w-lg waves-effect waves-light'
                                 onClick={async (evt: any) => {
                                     evt.preventDefault();
                                     history.push(`/client-dashboard-connecting`);
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

export default asyncReactor(AsyncDashboardStart, Loader);
