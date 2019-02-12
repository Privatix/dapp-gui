import * as React from 'react';
import { translate } from 'react-i18next';
import Slider from 'rc-slider';

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

    Range = null;

    constructor(props: IProps){
        super(props);
        const createSliderWithTooltip = Slider.createSliderWithTooltip;
        this.Range = createSliderWithTooltip(Slider.Range);
    }

    render () {

        const { t, onChangeMinPrice, onChangeMaxPrice, onChangeRange, min, max, step, start, end } = this.props;

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
                            <this.Range value={[start, end]}
                                   min={min}
                                   max={max}
                                   step={step}
                                   onChange={onChangeRange}
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
