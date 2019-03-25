import * as React from 'react';
import { connect } from 'react-redux';

import handlers from 'redux/actions';

import { Dispatch } from 'redux';
import { State } from 'typings/state';

interface IProps {
    advancedMode: boolean;
    setAdvancedMode?(mode:boolean): void;
}

class SwitchAdvancedModeButton extends React.Component<IProps, {}> {

    onClick = (evt) => {
        evt.preventDefault();
        console.log('ADVANCED!!!');
        const { setAdvancedMode, advancedMode } = this.props;
        setAdvancedMode(!advancedMode);
    }

    render(){

        const { advancedMode } = this.props;

        return <a href='' onClick={this.onClick}>{advancedMode ? 'Lighweight Mode' : 'Advanced Mode'}</a>;
    }
}

const mapStateToProps = (state: State) => {
    const { advancedMode } = state;
    return { advancedMode };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => ({ 
    setAdvancedMode: (mode: boolean) => {
        dispatch(handlers.setAdvancedMode(mode));
    }
});

export default connect<IProps>(mapStateToProps, mapDispatchToProps)(SwitchAdvancedModeButton);
