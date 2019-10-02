import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { Mode } from 'typings/mode';
import { State } from 'typings/state';

import { asyncProviders } from 'redux/actions';
import * as log from 'electron-log';

interface IProps {
    stoppingSupervisor?: boolean;
    mode: State['mode'];
    setSimpleMode?: any;
}
class Trigger extends React.Component<IProps, {}> {

    componentDidUpdate(){
        const { mode, setSimpleMode, stoppingSupervisor } = this.props;
        if(stoppingSupervisor && mode !== Mode.SIMPLE){
            setSimpleMode();
        }
    }

    render(){
        const { stoppingSupervisor } = this.props;
        return stoppingSupervisor ? '' : null;
    }

}

const mapDispatchToProps = (dispatch: Dispatch<any>) => ({
    setSimpleMode: () => {
        log.log('SET SIMPLE MODE');
        dispatch(asyncProviders.setMode(Mode.SIMPLE));
    }
});
export default connect((state: State) => ({mode: state.mode, stoppingSupervisor: state.stoppingSupervisor}), mapDispatchToProps)(Trigger);
