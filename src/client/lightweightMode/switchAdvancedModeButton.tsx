import * as React from 'react';
import { connect } from 'react-redux';
import { WithTranslation, withTranslation } from 'react-i18next';

import { asyncProviders } from 'redux/actions';

import { Dispatch } from 'redux';

import { State } from 'typings/state';
import { Mode } from 'typings/mode';

interface IProps extends WithTranslation {
    setAdvancedMode?(): void;
    ws: State['ws'];
}

const translate = withTranslation(['client/simpleMode']);

class SwitchAdvancedModeButton extends React.Component<IProps, {}> {

    onClick = (evt) => {
        evt.preventDefault();
        const { ws, setAdvancedMode } = this.props;
        setAdvancedMode();
        ws.setGUISettings({mode: 'advanced'});
    }

    render(){
        const { t } = this.props;

        return <a href='' onClick={this.onClick}>{t('AdvancedMode')}</a>;
    }
}

const mapStateToProps = (state: State) => ({ws: state.ws});

const mapDispatchToProps = (dispatch: Dispatch<any>) => ({
    setAdvancedMode: () => {
        dispatch(asyncProviders.setMode(Mode.ADVANCED));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(translate(SwitchAdvancedModeButton));
