import * as React from 'react';
import { render } from 'react-dom';
import { Link } from 'react-router-dom';
import EditProduct from './editProduct';

export default function(props:any){

    const onClick = function(evt:any){
        evt.preventDefault();
        evt.stopPropagation();
        render(<EditProduct product={props.product} />, document.getElementById('editProduct'));
    };

    return <div>
        <a href='' onClick={onClick}>Edit</a> | <Link to={'/'}>back</Link>
        <hr />
        <div id='editProduct'>
        </div>
    </div>;

}
