import * as React from 'react';
import ProductView from './productView';
import ProductTools from './productTools';

export default function(props:any){
    const product = JSON.parse(props.match.params.product);
    return <div>
        product view
        <ProductView product={product} /><hr />
        product toolbar
        <ProductTools product={product} />
    </div>;
}
