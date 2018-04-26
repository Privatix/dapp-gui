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
        <form>
            <fieldset className='form-group text-center'>
                <legend>Warning Area</legend>
                    <button type='button' className='btn btn-danger waves-effect waves-light' onClick={onDelete}>Delete</button>
            </fieldset>
        </form>
        <div className='text-center'>
            <a href='' onClick={onClick} className='btn btn-default waves-effect waves-light m-r-15'>Edit product</a>
            <Link to={`/template/${props.product.offerAccessID}`} className='btn btn-default waves-effect waves-light'>Access Template</Link>
        </div>
    </div>;

}
