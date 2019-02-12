import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { withRouter } from 'react-router-dom';

import ModalWindow from 'common/modalWindow';
import CreateOffering from './createOffering';
import OfferingsListView from './offeringsListView';
import OfferingsListByStatus from './offeringsListByStatus';

import { State } from 'typings/state';
import { OfferStatus } from 'typings/offerings';
import { Product } from 'typings/products';
import { WS } from 'utils/ws';

interface IProps {
    product: string;
    products?: Product[];
    statuses: OfferStatus[];
    ws?: WS;
    t?: any;
    onlyTable?: boolean;
    page?: string;
}

@translate(['offerings/offerings', 'offerings'])
class Offerings extends React.Component<IProps, any>{

    private subscribes = [];

    constructor(props: IProps){
        super(props);
        this.state = {
            offerings: [],
        };
    }

    componentDidMount(){
        this.refresh();
    }

    componentDidUpdate(prevProps:any, prevState:any) {
        if (this.props.statuses !== prevProps.statuses) {
            this.refresh();
        }
    }

    componentWillUnmount(){
        this.unsubscribe();
    }

    async unsubscribe(){

        const { ws } = this.props;

        await Promise.all(this.subscribes.map(subscribeId => ws.unsubscribe(subscribeId)));
        this.subscribes = [];

    }

    refresh = async () => {

        const { ws, product, products, statuses } = this.props;
        const productId = product === 'all' ? '' : product;

        const offerings_wo_products = await ws.getAgentOfferings(productId, statuses);

        const resolveTable = products.reduce((table, product) => {
            table[product.id] = product.name;
            return table;
        }, {});

        const offerings = offerings_wo_products.items.map(offering => Object.assign(offering, {productName: resolveTable[offering.product]}));

        await this.unsubscribe();
        this.subscribes = await Promise.all([ws.subscribe('channel', ['agentAfterChannelCreate'], this.refresh), /* available supply */
                                             ws.subscribe('offering', offerings.map(offering => offering.id), this.refresh),
                                             ws.subscribe('offering', ['agentPreOfferingMsgBCPublish'], this.refresh), /* new offering */
                                            ]);

        this.setState({offerings});
    }

    render() {

        const { t, onlyTable, page, products } = this.props;
        const { offerings } = this.state;

        if(onlyTable){
            return <OfferingsListView products={products} offerings={offerings} />;
        }

        if (page) {
            return <OfferingsListByStatus page={page} products={products} offerings={offerings} />;
        }

        return (
            <div className='container-fluid'>
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
                        </div>
                    </div>
                </div>
                <OfferingsListView products={products} offerings={offerings} />
           </div>
        );
    }
}

export default connect((state: State, onProps: IProps) => {
    return (Object.assign({}, {ws: state.ws, products: state.products}, onProps));
})(withRouter(Offerings));
