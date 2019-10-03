import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { WithTranslation, withTranslation } from 'react-i18next';

import ModalWindow from 'common/modalWindow';
import CreateOffering from 'agent/offerings/createOffering/';
import Product from './product';

import { WS, ws } from 'utils/ws';
import {Product as ProductType} from 'typings/products';

interface IProps extends WithTranslation {
    ws?: WS;
    history?: any;
    product: ProductType;
}

const translate = withTranslation(['products/productItem', 'offerings', 'offerings/offerings']);

class ProductItem extends React.Component<IProps, any>{

    constructor(props:IProps){
        super(props);

        this.state = {
            visible: false,
            offerings: [],
            offerTemplate: null,
            accessTemplate: null
        };

        this.getTemplates();
        this.getOfferings();

    }


    onOfferingCreated = () => {
        this.props.history.push('/offerings/all');
    }

    async getTemplates() {

        const { ws } = this.props;

        const templates = await ws.getTemplates();

        let offerTemplate = null, accessTemplate = null;
        if(templates.length){
            templates.forEach(template => {
                if(template.kind === 'offer'){
                    offerTemplate = template;
                }
            });
            templates.forEach(template => {
                if(template.kind === 'access'){
                    accessTemplate = template;
                }
            });

            this.setState({offerTemplate, accessTemplate});
        }
    }

    async getOfferings() {

        const { ws, product } = this.props;

        const offerings = await ws.getAgentOfferings(product.id);
        if(offerings.items){
            this.setState({offerings: offerings.items});
        }
    }

    render(){

        const { t, product } = this.props;

        const elem = <tr key={product.id}>
             <td>
                 { <ModalWindow customClass=''
                                modalTitle={t('ServerInfo')}
                                text={product.name}
                                component={<Product product={product} />}
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
                               component={<CreateOffering product={product.id} done={this.onOfferingCreated}/>}
                  />}
             </td>
         </tr>;
        return elem;
    }
}

export default ws<IProps>(withRouter(translate(ProductItem)));
