import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import handlers from 'redux/actions';

import { Dispatch } from 'redux';
import { State } from 'typings/state';

interface IProps {
    advancedMode: boolean;
    setAdvancedMode?(mode:boolean): void;
    t?: any;
}

@translate(['client/simpleMode'])
class SwitchAdvancedModeButton extends React.Component<IProps, {}> {

    onClick = (evt) => {
        evt.preventDefault();
        const { setAdvancedMode, advancedMode } = this.props;
        setAdvancedMode(!advancedMode);
    }

    render(){

        const { t, advancedMode } = this.props;

        return <a href='' style={ {margin: '10px'} } onClick={this.onClick}>{advancedMode ? t('LighweightMode') : t('AdvancedMode')}</a>;
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
