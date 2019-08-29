import * as React from 'react';
import { translate } from 'react-i18next';

import GasRange from 'common/etc/gasRange';

import { Transaction } from 'typings/transactions';

interface IProps {
    t?: any;
    transaction: Transaction;
}

interface IState {
    disabledBtn: boolean;
    gasPrice: number;
}

@translate('transactions/transactionsList')
class ResendTransaction extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            disabledBtn: false
           ,gasPrice: props.transaction.gasPrice
        };
    }

    onGasPriceChanged = (evt:any) => {
        const { transaction } = this.props;
        const gasPrice = Math.floor(evt.target.value * 1e9);
        if(gasPrice > transaction.gasPrice){
            this.setState({gasPrice});
        }
    }

    onResend = (evt: any) => {
        evt.preventDefault();
        this.setState({disabledBtn: true});
    }

    render() {

        const { t, transaction } = this.props;
        const { gasPrice, disabledBtn } = this.state;

        return (
            <>
                <GasRange onChange={this.onGasPriceChanged} value={Math.floor(gasPrice/1e9)} transactionFee={transaction.gas} />
                {!disabledBtn
                    ? <button className='btn btn-default waves-effect waves-light btn-block' onClick={this.onResend}>{t('Resend')}</button>
                    : <div className='btn btnCustomDisabled disabled btn-block' >{t('Resend')}</div>
                }
            </>
        );
    }
}

export default ResendTransaction;
