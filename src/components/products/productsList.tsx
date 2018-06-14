import * as React from 'react';
// import { Link } from 'react-router-dom';
import {fetch} from '../../utils/fetch';
import { withRouter } from 'react-router-dom';
import ProductItem from './productItem';

class AsyncProducts extends React.Component<any, any>{

    constructor(props:any) {
        super(props);
        this.state = { products: [], props: props};

        fetch(`/products`, {})
            .then((products: any) => {
                this.setState({products});
            });
    }

    render() {
        const list = (this.state.products as any).map((product:any) => <ProductItem product={product} {...this.props} /> );

        return (
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-sm-12 m-b-15'>
                        <h3 className='page-title'>Servers list</h3>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-12'>
                        <div className='card-box'>
                            <div className='table-responsive'>
                                <table className='table table-bordered table-striped'>
                                    <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Offering template</th>
                                        <th>Access template</th>
                                        <th>Offering count</th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {list}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(AsyncProducts);
