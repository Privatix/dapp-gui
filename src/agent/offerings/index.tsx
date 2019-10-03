import * as React from 'react';
import { connect } from 'react-redux';
import { WithTranslation, withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';

import ModalWindow from 'common/modalWindow';
import CreateOffering from './createOffering';
import OfferingsListView from './offeringsListView';
import OfferingsListByStatus from './offeringsListByStatus';

import { State } from 'typings/state';
import { OfferStatus } from 'typings/offerings';
import { Product } from 'typings/products';
import { WS } from 'utils/ws';

interface IProps extends WithTranslation {
    product: string;
    products?: Product[];
    statuses: OfferStatus[];
    ws?: WS;
    onlyTable?: boolean;
    page?: string;
}

const translate = withTranslation(['offerings/offerings', 'offerings']);

class Offerings extends React.Component<IProps, any>{

    private subscribes = [];
    private mounted = false;

    constructor(props: IProps){
        super(props);
        this.state = {
            offerings: [],
        };
    }

    componentDidMount(){
        this.mounted = true;
        this.refresh();
    }

    componentDidUpdate(prevProps:any) {
        if (this.props.statuses !== prevProps.statuses) {
            this.refresh();
        }
    }

    componentWillUnmount(){
        this.mounted = false;
        this.unsubscribe();
    }

    async unsubscribe(){

        const { ws } = this.props;

        const subscribes = this.subscribes;
        this.subscribes = [];
        await Promise.all(subscribes.map(subscribeId => subscribeId && ws.unsubscribe(subscribeId)));

    }

    refresh = async () => {

        if(!this.mounted){
            return;
        }

        const { ws, product, products, statuses } = this.props;
        const productId = product === 'all' ? '' : product;

        const offerings_wo_products = await ws.getAgentOfferings(productId, statuses);

        const resolveTable = products.reduce((table, product) => {
            table[product.id] = product.name;
            return table;
        }, {});

        const offerings = offerings_wo_products.items.map(offering => Object.assign(offering, {productName: resolveTable[offering.product]}));
        if(this.mounted){
            this.setState({offerings});
        }
        // await this.unsubscribe();
        if(!this.subscribes[0]){
            const subscribeId = await ws.subscribe('channel', ['agentAfterChannelCreate'], this.refresh); /* available supply */
            if(!this.subscribes[0]){
                this.subscribes[0] = subscribeId;
            }else{
                ws.unsubscribe(subscribeId);
            }
        }
        if(this.subscribes[1]){
            ws.unsubscribe(this.subscribes[1]);
            this.subscribes[1] = null;
        }
        const subscribeId = await ws.subscribe('offering', ['agentPreOfferingMsgBCPublish', ...offerings.map(offering => offering.id)], this.refresh);
        if(!this.subscribes[1]){
            this.subscribes[1] = subscribeId;
        }else{
            ws.unsubscribe(subscribeId);
        }

        if(!this.mounted){
            this.unsubscribe();
        }
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

export default connect((state: State, onProps: any) => {
    return (Object.assign({}, {ws: state.ws, products: state.products}, onProps));
})(withRouter(translate(Offerings)));
