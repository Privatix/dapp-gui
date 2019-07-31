import * as React from 'react';
import { translate } from 'react-i18next';
import { Range } from 'rc-slider';

import toFixedN from 'utils/toFixedN';

interface IProps {
    t?: any;
    onChangeMinPrice(evt: any): void;
    onChangeMaxPrice(evt: any): void;
    onChangeRange(evt: any): void;
    min: number;
    max: number;
    step: number;
    start: number;
    end: number;
}

interface IState {
}

const translated = translate(['client/vpnList']);

class SelectByPrice extends React.Component<IProps, IState>{


    onChangeRange = (value: any) => {
        const { onChangeRange, max } = this.props;
        const k = 100000/max;
        const [ from, to ] = value;
        onChangeRange([from/k, to/k]);
    }

    render () {

        const { t, onChangeMinPrice, onChangeMaxPrice, min, max, step, start, end } = this.props;
        const k = 100000/max;

        return (
            <div className='card m-b-20'>
                <div className='card-body'>
                    <h6 className='card-title'>{t('PriceFilter')}</h6>
                    <div className='form-group row'>
                        <div className='col-6 priceMinMaxInputBl'>
                            <div className='input-group'>
                                <div className='input-group-prepend'>
                                    <span className='input-group-text' id='priceFromLabel'>{t('From')}</span>
                                </div>
                                <input type='number'
                                       min={min}
                                       max={max - step}
                                       step={step}
                                       className='form-control'
                                       placeholder={String(min)}
                                       value={toFixedN({number: start, fixed: 8})}
                                       onChange={onChangeMinPrice}
                                />
                            </div>
                        </div>
                        <div className='col-6 priceMinMaxInputBl'>
                            <div className='input-group'>
                                <div className='input-group-prepend'>
                                    <span className='input-group-text' id='priceToLabel'>{t('To')}</span>
                                </div>
                                <input type='number'
                                       min={min + step}
                                       max={max}
                                       step={step}
                                       className='form-control'
                                       placeholder={String(max)}
                                       value={toFixedN({number: end, fixed: 8})}
                                       onChange={onChangeMaxPrice}
                                />
                            </div>
                        </div>
                    </div>
                    <div className='row m-t-30'>
                        <div className='col-12'>
                            <Range value={[start*k, end*k]}
                                   min={min*k}
                                   max={max*k*1.01}
                                   step={step*k}
                                   onChange={this.onChangeRange}
                                   allowCross={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default translated(SelectByPrice);
