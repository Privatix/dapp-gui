import * as React from 'react';
import {connect} from 'react-redux';
import { translate } from 'react-i18next';

import {State} from 'typings/state';
import {LocalSettings} from 'typings/settings';

interface IProps {
    t?: any;
    localSettings?: LocalSettings;
    jobId: string;
}

interface IState {
    disabledBtn: boolean;
}

@translate('jobs/jobsList')
class RestartBtn extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            disabledBtn: false
        };
    }

    render() {

        const { t } = this.props;

        return (
            <button className='btn btn-default btn-custom waves-effect waves-light m-b-30 m-r-20'>
                {t('Restart')}
            </button>
        );
    }
}

export default connect( (state: State) => ({localSettings: state.localSettings}) )(RestartBtn);
