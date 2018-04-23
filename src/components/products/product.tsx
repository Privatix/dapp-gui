import * as React from 'react';
import ProductView from './productView';
import ProductTools from './productTools';

export default function(props:any){
    const product = JSON.parse(props.match.params.product);
    return <div>
        <table>
            <tbody>
                <tr>
                    <td><ProductView product={product} /></td>
                    <td><ProductTools product={product} /></td>
                </tr>
            </tbody>
        </table>
    </div>;
}
