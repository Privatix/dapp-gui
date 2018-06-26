import * as React from 'react';
import { Link } from 'react-router-dom';
import {fetch} from '../utils/fetch';
// import {fetchOfferings} from './offerings/utils';
import {asyncReactor} from 'async-reactor';
import ChannelsListByStatus from './channels/channelsListByStatus';
import OfferingsList from './offerings/offeringsList';

function Loader() {

  return (<h2>Loading sessions ...</h2>);

}

async function refresh() {
    const sessions = await fetch(`/sessions`, {method: 'GET'});
    return await (sessions as any).reduce(async (income, session) => {
        const channels = await fetch(`/channels?id=${session.channel}`, {method: 'GET'});
        return income + (channels as any).reduce((income, channel) => {return income + channel.receiptBalance;}, 0);
    }, 0);
}

async function AsyncMain (props:any){
    // const {offerings, products} = await fetchOfferings('all');
    let income: any = refresh();

    return <div className='container-fluid'>
        <div className='row'>
            <div className='col-sm-12 m-b-20'>
                <h3 className='page-title'>Total income: {(income/1e8).toFixed(3)} PRIX</h3>
            </div>
        </div>
        <div className='row'>
            <div className='col-sm-12 m-b-15'>
                <div className='m-t-15'>
                    <Link to={'#'} onClick={()=>{income = refresh();}} className='btn btn-default btn-custom waves-effect waves-light'>Refresh all</Link>
                </div>
            </div>
        </div>
        <div className='row'>
            <div className='col-sm-12'>
                <div className='card m-b-20'>
                    <h5 className='card-header'>Active Services</h5>
                    <div className='card-body'>
                        <form>
                            <ChannelsListByStatus status={'active'}/>
                        </form>
                    </div>
                </div>
                <div className='card m-b-20'>
                    <h5 className='card-header'>Active Offerings</h5>
                    <div className='card-body'>
                        <form>
                            <OfferingsList product={'all'} rate={3000} />
                            {/*<OfferingsList offerings={offerings} products={products} />*/}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>;
}

export default asyncReactor(AsyncMain, Loader);
