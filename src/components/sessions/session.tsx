import * as React from 'react';
import SessionView from './sessionView';
import SessionTools from './sessionTools';

export default function(props:any){
    const session = JSON.parse(props.match.params.session);
    return <div> session view<br />
        <SessionView session={session} /> <hr />
        <SessionTools session={session.id} />
    </div>;
}
