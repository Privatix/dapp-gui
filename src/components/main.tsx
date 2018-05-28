import * as React from 'react';
import {fetch} from '../utils/fetch';
import {asyncReactor} from 'async-reactor';
import ChannelsListByStatus from './channels/channelsListByStatus';
import OfferingsList from './offerings/offeringsList';

function Loader() {

  return (<h2>Loading sessions ...</h2>);

}

async function AsyncMain (props:any){

    const sessions = await fetch(`/sessions`, {method: 'GET'});
    const income = await (sessions as any).reduce(async (income, session) => {
        const channels = await fetch(`/channels?id=${session.channel}`, {method: 'GET'});
        return income + (channels as any).reduce((income, channel) => {return income + channel.receiptBalance;}, 0);
    }, 0);
    return <div className='container-fluid'>
        <div className='row'>
            <div className='col-sm-12 m-b-20'>
                <h3 className='page-title'>Total income: {(income/1e8).toFixed(3)} PRIX</h3>
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
                            <OfferingsList product={'all'}/>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>;
}

export default asyncReactor(AsyncMain, Loader);
