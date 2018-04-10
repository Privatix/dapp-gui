import * as React from 'react';
import ProductView from './productView';
import ProductTools from './productTools';

export default function(props:any){
    const product = JSON.parse(props.match.params.product);
    return <div>
        <ProductView product={product} /><hr />
        <ProductTools product={product} />
    </div>;
}
