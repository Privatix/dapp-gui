import * as React from 'react';
import {fetch} from '../../utils/fetch';
import { withRouter } from 'react-router-dom';
import ModalWindow from '../modalWindow';
import CreateOffering from '../offerings/createOffering';
import Product from './product';

class ProductItem extends React.Component<any, any>{

    constructor(props:any){
        super(props);

        this.state = {visible: false, offerings: []};

        fetch(`/templates`, {})
            .then((templates: any) => {
                let offerTemplate, accessTemplate;
                    if((templates as any).length){
                        (templates as any).forEach(template => {
                            if(template.kind === 'offer'){
                                offerTemplate = template;
                            }
                        });
                        (templates as any).forEach(template => {
                            if(template.kind === 'access'){
                                accessTemplate = template;
                            }
                        });
                        offerTemplate.raw = JSON.parse(atob(offerTemplate.raw));
                        accessTemplate.raw = JSON.parse(atob(accessTemplate.raw));
                        this.setState({offerTemplate, accessTemplate});
                    }
            });
        fetch(`/offerings/?product=${props.product.id}`, {})
            .then((offerings: any) => {
                this.setState({offerings});
            });
    }


    onOfferingCreated(){
        this.props.history.push('/offerings/all');
    }

    render(){
        const elem = <tr key={this.props.product.id}>
             <td>{ <ModalWindow customClass='' modalTitle='Server info' text={this.props.product.name} component={<Product product={this.props.product} />} /> }</td>
             <td>{this.state.offerTemplate? this.state.offerTemplate.raw.schema.title : ''}</td>
             <td>{this.state.accessTemplate ? this.state.accessTemplate.raw.title : ''}</td>
             <td>{(this.state.offerings as any).length}</td>
             <td>{<ModalWindow visible={this.state.visible} customClass='btn btn-default btn-custom waves-effect waves-light' modalTitle='Create offering' text='Create an offering' component={<CreateOffering product={this.props.product.id} done={this.onOfferingCreated.bind(this)}/>} />}</td>
         </tr>;
        return elem;
    }
}

export default withRouter(ProductItem);
