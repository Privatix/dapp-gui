import * as React from 'react';
import { Link } from 'react-router-dom';

export default function(props:any){

    return <div>
        <hr />
        <table>
            <tbody>
                <tr><td>name:</td><td>{props.product.name}</td></tr>
                <tr><td>dns:</td><td>{}</td></tr>
                <tr><td>ip_addr:</td><td>{}</td></tr>
                <tr><td>additional_params:</td><td>{}</td></tr>
            </tbody>
        </table>
        <Link to={`/template/${props.product.offerAccessID}`}>Access Template</Link>
    </div>;
}
