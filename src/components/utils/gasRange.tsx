import * as React from 'react';
import ExternalLink from './externalLink';
import * as _ from 'lodash';

export default class GasRange extends React.Component<any, any> {

    constructor(props: any){
        super(props);

        const extLinkText = (_.isString(props.extLinkText)) ? props.extLinkText : 'https://ethgasstation.info/';
        const averageTimeText = (_.isString(props.averageTimeText)) ? props.averageTimeText : 'publication';

        this.state = {
            value: props.value,
            gasPrice: props.value*1e9,
            averageTime: this.averageTime(props.value),
            extLinkText,
            averageTimeText
        };
    }

    changeGasPrice(evt: any){
        this.setState({value: evt.target.value, gasPrice: evt.target.value * 1e9, averageTime: this.averageTime(evt.target.value)});
        if(typeof this.props.onChange === 'function'){
            this.props.onChange(evt);
        }
    }

    averageTime(price: number) {
        price = Math.floor(price);
        const table = {0: '∞', 5: '< 30', 6: '< 5', 10: '< 2'};
        let res;
        for(let i=price; i>=0; i--){
            if(table[i] !== undefined){
                res = table[i];
                if(i <= price){
                    return res;
                }
            }
        }
        return res;
    }

    render() {
        return <div>
            <div className='form-group row'>
                <label className='col-2 col-form-label'>Gas price</label>
                <div className='col-md-6'>
                    <input className='form-control' onChange={this.changeGasPrice.bind(this)} type='range' name='range' min='0' max='20' step='any' value={this.state.value}/>
                </div>
                <div className='col-4 col-form-label'>
                    <span>{Number(this.state.value).toFixed(2)}</span> Gwei
                </div>
            </div>
            <div className='form-group row'>
                <div className='col-12 col-form-label'>
                    <strong>Average {this.state.averageTimeText} time: {this.state.averageTime} min</strong>
                </div>
                <div className='col-12 col-form-label'>
                    <strong>More information:</strong> <ExternalLink href='https://ethgasstation.info/' text={this.state.extLinkText} />
                </div>
            </div>
        </div>;
    }
}
