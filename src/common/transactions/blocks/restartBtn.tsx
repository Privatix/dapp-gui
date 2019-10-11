import * as React from 'react';
import {connect} from 'react-redux';
import { WithTranslation, withTranslation } from 'react-i18next';

import {State} from 'typings/state';
import {LocalSettings} from 'typings/settings';
import { Transaction } from 'typings/transactions';

interface IProps extends WithTranslation {
    localSettings?: LocalSettings;
    ws?: State['ws'];
    transaction: Transaction;
}

interface IState {
    disabledBtn: boolean;
}

const translate = withTranslation('transactions/transactionsList');

class RestartBtn extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            disabledBtn: false
        };
    }

    onClick = (evt: any) => {
        evt.preventDefault();
        const { ws, transaction, localSettings } = this.props;

        ws.increaseTxGasPrice(transaction.id, Math.floor(transaction.gasPrice*localSettings.gas.transactionIncreaseCoefficient));
    }

    render() {

        const { t } = this.props;

        return (
            <button onClick={this.onClick} className='btn btn-default btn-custom waves-effect waves-light m-b-30 m-r-20'>
                {t('Resend')}
            </button>
        );
    }
}

export default connect( (state: State) => ({ws: state.ws, localSettings: state.localSettings}) )(translate(RestartBtn));
