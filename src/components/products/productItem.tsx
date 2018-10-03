import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';

import ModalWindow from '../modalWindow';
import CreateOffering from '../offerings/createOffering';
import Product from './product';
import * as api from '../../utils/api';

@translate(['products/productItem', 'offerings', 'offerings/offerings'])
class ProductItem extends React.Component<any, any>{

    constructor(props:any){
        super(props);

        this.state = {visible: false, offerings: []};

        api.templates.getTemlates()
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

                        this.setState({offerTemplate, accessTemplate});
                    }
            });
        api.offerings.getOfferings(null,props.product.id)
            .then((offerings: any) => {
                this.setState({offerings});
            });
    }


    onOfferingCreated(){
        this.props.history.push('/offerings/all');
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
             <td>{(this.state.offerings as any).length}</td>
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
