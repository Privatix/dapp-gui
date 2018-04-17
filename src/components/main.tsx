import * as React from 'react';
import { Link /*, withRouter */ } from 'react-router-dom';
import {asyncReactor} from 'async-reactor';
// import {fetch} from 'utils/fetch';

function Loader() {

  return (<h2>Loading settings ...</h2>);

}

async function AsyncMain (props:any){

    return  <div>main page
                  <hr />
                  <Link to={'/settings'}>settings</Link><br/>
                  <Link to={'/templates'}>templates</Link><br/>
                  <Link to={'/products'}>products</Link><br />
                  <Link to={'/offerings/all'}>offerings</Link><br />
                  <Link to={'/channels/all'}>channels</Link><br />
                  <Link to={'/sessions/all'}>sessions</Link>
              </div>;
}

export default asyncReactor(AsyncMain, Loader);
