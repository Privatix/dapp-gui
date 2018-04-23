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

    const onDelete = function(evt:any){
        evt.preventDefault();
        evt.stopPropagation();
        // TODO request endpoint
        console.log('DELETE!!!');
    };

    return <div>
        <Link to={`/template/${props.product.offerTplID}`}>Create an Offering</Link><br />
        <form>
            <fieldset>
                <legend>Warning Area</legend>
                    <button type='button' onClick={onDelete}>Delete</button>
            </fieldset>
        </form>
        <a href='' onClick={onClick}>Edit</a>
        <hr />
        <div id='editProduct'>
        </div>
    </div>;

}
