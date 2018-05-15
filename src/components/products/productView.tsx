import * as React from 'react';

export default function(props:any){

    return <div>
        <table className='table table-striped'>
            <tbody>
                <tr><td>name:</td><td>{props.product.name}</td></tr>
                <tr><td>dns:</td><td>{}</td></tr>
                <tr><td>ip_addr:</td><td>{}</td></tr>
                <tr><td>additional_params:</td><td>{}</td></tr>
            </tbody>
        </table>
    </div>;
}
