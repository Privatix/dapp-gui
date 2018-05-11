import * as React from 'react';
// import Form from 'react-jsonschema-form';
// import { Link } from 'react-router-dom';
import {fetch} from 'utils/fetch';
import {asyncReactor} from 'async-reactor';

function Loader() {

  return (<h2>Loading settings ...</h2>);

}

async function AsyncSettings(props:any){

    return await fetch('/settings', {method: 'GET'}).then(options => {

        const schema = {
        'schema': {
          'title': 'edit settings',
          'type': 'object',
          'properties': {
          }
        },
        'uiSchema': {
        }
      };

        (options as any).forEach((option: any) => {
            schema.schema.properties[option.key] = {'type': 'string', 'default': option.value};
            schema.uiSchema[option.key] = {'ui:help': option.description};
        });
        
        // const onSubmit = ({formData}) => {
        //     const settings = Object.keys(formData).map(key => { return {key, 'value': formData[key], 'description': schema.uiSchema[key]['ui:help']}; });
        //     fetch('/settings', {method: 'put', body: settings}).then(res => {
        //         // ReactDOM.unmountComponentAtNode(document.getElementById('template'));
        //     });
        // };
        // return <div><Form schema={schema.schema} uiSchema={schema.uiSchema} onSubmit={onSubmit}>
        //     <div>
        //       <button type='submit'>save</button>
        //       <Link to={'/'}>Cancel</Link>
        //     </div>
        // </Form></div>;

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
                            <form>
                                <table className='table table-bordered table-striped'>
                                    <thead>
                                    <tr>
                                        <th width='30%'>Name</th>
                                        <th width='10%'>Value</th>
                                        <th>Description</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td>Notifications:</td>
                                        <td>
                                            <div className='checkbox checkbox-custom text-center'>
                                                <input id='checkbox1' type='checkbox' />
                                                <label htmlFor='checkbox1' className='m-b-15'></label>
                                            </div>
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Do not store history:</td>
                                        <td>
                                            <div className='checkbox checkbox-custom text-center'>
                                                <input id='checkbox2' type='checkbox' />
                                                <label htmlFor='checkbox2' className='m-b-15'></label>
                                            </div>
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Ask a password after idle:</td>
                                        <td>
                                            <div className='checkbox checkbox-custom text-center'>
                                                <input id='checkbox3' type='checkbox' />
                                                <label htmlFor='checkbox3' className='m-b-15'></label>
                                            </div>
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Idle time (min):</td>
                                        <td>
                                            <div className='input-group bootstrap-touchspin'>
                                                <span className='input-group-btn'>
                                                    <button className='btn btn-default bootstrap-touchspin-down' type='button'>-</button>
                                                </span>
                                                <input id='demo2' type='text' value='10' name='demo2' className='form-control text-center' />
                                                <span className='input-group-btn'>
                                                    <button className='btn btn-default bootstrap-touchspin-up' type='button'>+</button>
                                                </span>
                                            </div>
                                        </td>
                                        <td></td>
                                    </tr>
                                    </tbody>
                                </table>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    });
}

export default asyncReactor(AsyncSettings, Loader);
