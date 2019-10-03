import * as React from 'react';
import { withTranslation } from 'react-i18next';
import OfferingsListView from './offeringsListView';

const translate = withTranslation('offerings/offerings');

class OfferingsListByStatus extends React.Component<any, any>{

    constructor(props: any){
        super(props);
        this.state = {
            offerings: [],
            products: [],
            page: props.page
        };
    }

    static getDerivedStateFromProps(props:any) {
        return {
            products: props.products,
            offerings: props.offerings,
            page: props.page
        };
    }

    render() {
        const { t } = this.props;

        const title = this.state.page === 'active' ? t('ActiveOfferings'): t('HistoryOfferings');

        return <div className='container-fluid'>
            <div className='row'>
                <div className='col-sm-12 m-b-15'>
                    <h3 className='page-title'>{title}</h3>
                </div>
            </div>
            <OfferingsListView products={this.state.products} offerings={this.state.offerings} showRemoved={true} />
        </div>;
    }
}

export default translate(OfferingsListByStatus);
