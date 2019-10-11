import * as React from 'react';
import {connect} from 'react-redux';
import { WithTranslation, withTranslation } from 'react-i18next';

import {State} from 'typings/state';

interface IProps extends WithTranslation {
    jobId: string;
    onClick?: Function;
    ws?: State['ws'];
}

interface IState {
    disabledBtn: boolean;
}

class RestartBtn extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            disabledBtn: false
        };
    }

    onClick = async (evt: any) => {
        const { ws, onClick, jobId } = this.props;
        evt.preventDefault();
        this.setState({disabledBtn: true});
        await ws.reactivateJob(jobId);
        if(onClick){
            onClick();
        }
        this.setState({disabledBtn: false});
    }

    render() {

        const { t } = this.props;
        const { disabledBtn } = this.state;

        return (
            disabledBtn
                ? <div className='btn btnCustomDisabled disabled btn-default btn-custom waves-effect waves-light m-b-30 m-r-20' >{t('Restart')}</div>
                : <button onClick={this.onClick}
                        className='btn btn-default btn-custom waves-effect waves-light m-b-30 m-r-20'>
                    {t('Restart')}
                </button>
        );
    }
}

export default connect( (state: State) => ({ws: state.ws}) )(withTranslation('jobs/jobsList')(RestartBtn));
