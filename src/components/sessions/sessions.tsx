import * as React from 'react';
import sessionsList from './sessionsList';

export default function(props:any){

    return (
        <div>
          <h3>sessions</h3>
          <SessionsList channel='all' />
        </div>
   );
}
