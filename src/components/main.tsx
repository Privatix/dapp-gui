import * as React from 'react';
import ChannelsList from './channels/channelsList';
import OfferingsList from './offerings/offeringsList';

export default function (props: any) {
    return <div className='container-fluid'>
        {/* <Link to={'/settings'}>settings</Link><br/>
      <Link to={'/templates'}>templates</Link><br/>
      <Link to={'/products'}>products</Link><br />
      <Link to={'/offerings/all'}>offerings</Link><br />
      <Link to={'/channels/all'}>channels</Link><br />
      <Link to={'/sessions/all'}>sessions</Link> */}
        <div className='row'>
            <div className='col-sm-12 m-b-20'>
                <h3 className='page-title'>Total income: 120 PRIX</h3>
            </div>
        </div>
        <div className='row'>
            <div className='col-sm-12'>
                <div className='card m-b-20'>
                    <h5 className='card-header'>Active Services</h5>
                    <div className='card-body'>
                        <form>
                            <ChannelsList offering='all'/>
                        </form>
                    </div>
                </div>
                <div className='card m-b-20'>
                    <h5 className='card-header'>Active Offerings</h5>
                    <div className='card-body'>
                        <form>
                            <OfferingsList product='all'/>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>;
}
