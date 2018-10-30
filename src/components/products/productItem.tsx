import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';

import ModalWindow from '../modalWindow';
import CreateOffering from '../offerings/createOffering';
import Product from './product';

@translate(['products/productItem', 'offerings', 'offerings/offerings'])
class ProductItem extends React.Component<any, any>{

    constructor(props:any){
        super(props);

        this.state = {
            visible: false,
            offerings: [],
            offerTemplate: '',
            accessTemplate: ''
        };

        this.getTemplates();
        this.getOfferings();

    }


    onOfferingCreated(){
        this.props.history.push('/offerings/all');
    }

    async getTemplates() {
        const templates = await (window as any).ws.getTemplates();

        let offerTemplate = '', accessTemplate = '';
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

            this.setState({offerTemplate, accessTemplate});
        }
    }

    async getOfferings() {
        const offerings = await (window as any).ws.getAgentOfferings(this.props.product.id);
        if(offerings.items){
            this.setState({offerings: offerings.items});
        }
    }

    render(){

        const { t } = this.props;

        const elem = <tr key={this.props.product.id}>
             <td>
                 { <ModalWindow customClass=''
                                modalTitle={t('ServerInfo')}
                                text={this.props.product.name}
                                component={<Product product={this.props.product} />}
                   />}
             </td>
             <td>{this.state.offerTemplate? this.state.offerTemplate.raw.schema.title : ''}</td>
             <td>{this.state.accessTemplate ? this.state.accessTemplate.raw.title : ''}</td>
             <td>{this.state.offerings.length}</td>
             <td>
                 {<ModalWindow visible={this.state.visible}
                               customClass='btn btn-default btn-custom waves-effect waves-light'
                               modalTitle={t('offerings/offerings:CreateOffering')}
                               text={t('offerings:CreateAnOffering')}
                               component={<CreateOffering product={this.props.product.id} done={this.onOfferingCreated.bind(this)}/>}
                  />}
             </td>
         </tr>;
        return elem;
    }
}

export default withRouter(ProductItem);
