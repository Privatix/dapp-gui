import * as React from 'react';
// import {asyncReactor} from 'async-reactor';
import SortableTable from 'react-sortable-table';
import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';
import * as _ from 'lodash';

export default class AsyncList extends React.Component<any,any> {
    constructor(props:any) {
        super(props);

        const data = [
            {
                id: '1111',
                country: 'Ukraine',
                price: 0.05,
                publishTime: '31.05.2018'
            },
            {
                id: '3333',
                country: 'Russia',
                price: 0.33,
                publishTime: '19.04.2018'
            },
            {
                id: '2224',
                country: 'Israel',
                price: 0.12,
                publishTime: '01.06.2018'
            },
            {
                id: '74543',
                country: 'USA',
                price: 0.65,
                publishTime: '18.05.2018'
            }
        ];

        this.state = {
            from: 0,
            to: 1,
            spinner: true,
            changePriceInput: false,
            data,
            filtered: data.slice(),
            columns: [
                {
                    header: 'Id',
                    key: 'id'
                },
                {
                    header: 'Country',
                    key: 'country'
                },
                {
                    header: 'Price (PRIX/Mb)',
                    key: 'price'
                },
                {
                    header: 'Publish time',
                    key: 'publishTime'
                }
            ]
        };

        setTimeout(() => {
            this.setState({
                spinner: false
            });
        }, 3000);

    }

    shouldComponentUpdate(nextProps:any, nextState:any) {
        return (this.state.spinner !== nextState.spinner)
            || (this.state.changePriceInput !== nextState.changePriceInput)
            || !(_.isEqual(nextState.filtered, this.state.filtered));
    }

    changeMinPriceInput(evt:any) {
        let priceFrom = evt.target.value;
        if (priceFrom === '' || Number.isNaN(priceFrom) || (typeof priceFrom === 'undefined')) {
            priceFrom = this.state.from;
        }

        if (this.state.changePriceInput === true) {
            this.setState({changePriceInput: false});
        } else {
            this.setState({changePriceInput: true});
        }
        const priceTo = (document.getElementById('priceTo') as HTMLInputElement).value;

        this.changeRange([parseFloat(priceFrom), parseFloat(priceTo)]);
    }

    changeMaxPriceInput(evt:any) {
        let priceTo = evt.target.value;
        if (priceTo === '' || Number.isNaN(priceTo) || (typeof priceTo === 'undefined')) {
            priceTo = this.state.to;
        }
        if (this.state.changePriceInput === true) {
            this.setState({changePriceInput: false});
        } else {
            this.setState({changePriceInput: true});
        }
        const priceFrom = (document.getElementById('priceFrom') as HTMLInputElement).value;

        this.changeRange([parseFloat(priceFrom), parseFloat(priceTo)]);
    }

    changeRange(value:any) {
        let from = value[0];
        let to = value[1];
        (document.getElementById('priceFrom') as HTMLInputElement).value = from;
        (document.getElementById('priceTo') as HTMLInputElement).value = to;

        this.setState({
            from, to
        });

        const handler = setTimeout(() => {
            let filteredByPrice = this.state.data.filter((item) => {
                if (item.price >= from && item.price <= to) {
                    return true;
                }
                return false;
            });

            this.setState({
                filtered: filteredByPrice
            });
        }, 200);

        if (this.state.handler !== null) {
            clearTimeout(this.state.handler);
        }

        this.setState({handler});
    }

    render() {
        const createSliderWithTooltip = Slider.createSliderWithTooltip;
        const Range = createSliderWithTooltip(Slider.Range);

        return this.state.spinner ? <div className='container-fluid'>
            <div className='row m-t-20'>
                <div className='col-12'>
                    <div className='card'>
                        <div className='col-4 m-b-20'>
                            <div className='card-body'>
                                <p className='font-25'>Please, wait for downloading....</p>
                                <div className='text-center m-t-15 m-b-15'>
                                    <div className='lds-dual-ring'></div>
                                </div>
                                <p className='m-b-0'>Currently, we are downloading VPN list.</p>
                                <p>It takes time only on the first run.</p>
                                <p className='m-t-15'>An average time for downloading ap. 2-5 min.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        :
        <div className='container-fluid'>
            <div className='row m-t-20'>
                <div className='col-3'>
                    <div className='card m-b-20'>
                        <div className='card-body'>
                            <h6 className='card-title'>Price (PRIX/Mb):</h6>
                            <div className='form-group row'>
                                <div className='col-6'>
                                    <div className='input-group'>
                                        <div className='input-group-prepend'>
                                            <span className='input-group-text' id='priceFromLabel'>from</span>
                                        </div>
                                        <input type='number' step='0.01' className='form-control' placeholder='0' id='priceFrom' value={this.state.from} onChange={(e) => this.changeMinPriceInput(e)} />
                                    </div>
                                </div>
                                <div className='col-6'>
                                    <div className='input-group'>
                                        <div className='input-group-prepend'>
                                            <span className='input-group-text' id='priceToLabel'>to</span>
                                        </div>
                                        <input type='number' step='0.01' className='form-control' placeholder='1' id='priceTo' value={this.state.to} onChange={(e) => this.changeMaxPriceInput(e)} />
                                    </div>
                                </div>
                            </div>
                            <div className='row m-t-30'>
                                <div className='col-12'>
                                    <Range defaultValue={[this.state.from, this.state.to]} min={0} max={1} step={0.01}
                                           onChange={this.changeRange.bind(this)} allowCross={false}/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='card m-t-15 m-b-20'>
                        <h5 className='card-header'>Country</h5>
                        <div className='card-body'>
                            <div className='checkbox checkbox-custom'>
                                <input id='checkbox1' type='checkbox'/>
                                <label htmlFor='checkbox1'>Netherlands</label>
                            </div>
                            <div className='checkbox checkbox-custom'>
                                <input id='checkbox2' type='checkbox'/>
                                <label htmlFor='checkbox2'>Germany</label>
                            </div>
                            <div className='checkbox checkbox-custom'>
                                <input id='checkbox3' type='checkbox'/>
                                <label htmlFor='checkbox3'>Romania</label>
                            </div>
                            <div className='checkbox checkbox-custom'>
                                <input id='checkbox4' type='checkbox'/>
                                <label htmlFor='checkbox4'>Japan</label>
                            </div>
                            <div className='checkbox checkbox-custom'>
                                <input id='checkbox5' type='checkbox'/>
                                <label htmlFor='checkbox5'>Canada</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='col-9'>
                    <div className='card-box'>
                        <div className='bootstrap-table bootstrap-table-sortable'>
                            <SortableTable
                                data={this.state.filtered}
                                columns={this.state.columns}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}
