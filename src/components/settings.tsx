import * as React from 'react';
import {fetch} from 'utils/fetch';
import {asyncReactor} from 'async-reactor';
import { withRouter } from 'react-router-dom';

function Loader() {

  return (<h2>Loading settings ...</h2>);

}

async function AsyncSettings(props:any){

    const saveOptions = function(evt:any){
        evt.preventDefault();
        const inputs = document.getElementById('optionsForm').querySelectorAll('input');
        const payload = [].slice.call(inputs, 0).map(option => ({
            key: option.id
           ,value: option.value
           ,description: option.dataset.desc
           ,name: option.dataset.name
        }));
        fetch('/settings', {method: 'put', body: payload}).then(res => {
            // TODO notice?
            props.history.push('/app');
        });
    };

    return await fetch('/settings', {method: 'GET'}).then(options => {

        const optionsDOM = (options as any).map(option => <tr>
                                        <td>{option.name}:</td>
                                        <td>
                                            <div className='form-control text-right'>
                                                <input id={option.key} type='text' defaultValue={option.value} data-desc={option.description} data-name={option.name}/>
                                                <label htmlFor={option.key} className='m-b-15'></label>
                                            </div>
                                        </td>
                                        <td>{option.description}</td>
                                    </tr>);
        return (
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-sm-12 m-b-15'>
                        <h3 className='page-title'>Settings</h3>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-12'>
                        <div className='card-box'>
                            <div className='form-group row'>
                                <div className='col-md-12 m-t-10 m-b-10'>
                                    <div className='input-group searchInputGroup'>
                                        <div className='input-group-prepend'>
                                            <span className='input-group-text'><i className='fa fa-search'></i></span>
                                        </div>
                                        <input className='form-control' type='search' name='search' placeholder='search' />
                                    </div>
                                </div>
                            </div>
                            <form id='optionsForm'>
                                <table className='table table-bordered table-striped'>
                                    <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Value</th>
                                        <th>Description</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                        {optionsDOM}
                                    </tbody>
                                </table>
                                <button className='btn btn-default waves-effect waves-light' onClick={saveOptions}>Save</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    });
}

export default withRouter(asyncReactor(AsyncSettings, Loader));
