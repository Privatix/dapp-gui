import * as React from 'react';
import ChannelsList from './channels/channelsList';
import OfferingsList from './offerings/offeringsList';

export default function(props:any){
    return <div>Dashboard
      <hr />
        {/* <Link to={'/settings'}>settings</Link><br/>
      <Link to={'/templates'}>templates</Link><br/>
      <Link to={'/products'}>products</Link><br />
      <Link to={'/offerings/all'}>offerings</Link><br />
      <Link to={'/channels/all'}>channels</Link><br />
      <Link to={'/sessions/all'}>sessions</Link> */}
     <h3>Total income: 120 PRIX</h3>
     <form>
         <fieldset>
             <legend>Active Services</legend>
             <ChannelsList offering='all' />
         </fieldset>
     </form>
     <form>
         <fieldset>
             <legend>Active Offerings</legend>
             <OfferingsList product='all' />
         </fieldset>
     </form>
    </div>;
}
