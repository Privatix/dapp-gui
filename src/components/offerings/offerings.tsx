import * as React from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';

import ModalWindow from '../modalWindow';
import CreateOffering from './createOffering';
import OfferingsList from './offeringsList';
import {fetchOfferings} from './utils';

@translate(['offerings/offerings', 'offerings', 'common'])
class Offerings extends React.Component<any, any>{

    constructor(props: any){
        super(props);
        this.state = {offerings: [], products: []};
    }

    // componentDidMount(){
    //     this.refresh();
    // }

    refresh = () => {
        fetchOfferings(this.props.product).then((res: any) => {
            this.setState(res);
        });
    }

    render(){

        const { t } = this.props;

        return <div className='container-fluid'>
            <div className='row'>
                <div className='col-sm-12 m-b-15'>
                    <h3 className='page-title'>{t('Offerings')}</h3>
                </div>
            </div>
            <div className='row'>
                <div className='col-sm-12 m-b-20'>
                    <div className='btn-group m-t-5'>
                        <ModalWindow visible={false}
                                     customClass='btn btn-default btn-custom waves-effect waves-light m-r-15'
                                     modalTitle={t('CreateOffering')}
                                     text={t('offerings:CreateAnOffering')}
                                     component={<CreateOffering done={this.refresh} />}
                        />
                        <Link to={'#'} onClick={this.refresh} className='btn btn-default btn-custom waves-effect waves-light'>
                            {t('common:RefreshAll')}
                        </Link>
                    </div>
                </div>
            </div>
            <OfferingsList product={this.props.product} rate={3000} />
       </div>;
    }
}

export default withRouter(Offerings);
