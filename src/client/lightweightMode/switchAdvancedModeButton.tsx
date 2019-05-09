import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { asyncProviders } from 'redux/actions';

import { Dispatch } from 'redux';

import { State } from 'typings/state';
import { Mode } from 'typings/mode';

interface IProps {
    setAdvancedMode?(): void;
    t?: any;
}

@translate(['client/simpleMode'])
class SwitchAdvancedModeButton extends React.Component<IProps, {}> {

    onClick = (evt) => {
        evt.preventDefault();
        const { setAdvancedMode } = this.props;
        setAdvancedMode();
    }

    render(){

        const { t } = this.props;

        return <a href='' style={ {margin: '10px'} } onClick={this.onClick}>{t('AdvancedMode')}</a>;
    }
}

const mapStateToProps = (state: State) => ({});

const mapDispatchToProps = (dispatch: Dispatch<any>) => ({ 
    setAdvancedMode: () => {
        dispatch(asyncProviders.setMode(Mode.ADVANCED));
    }
});

export default connect<IProps>(mapStateToProps, mapDispatchToProps)(SwitchAdvancedModeButton);
