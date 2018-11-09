import * as React from 'react';
import { withRouter } from 'react-router-dom';
import {connect} from 'react-redux';

import {State} from 'typings/state';
import {asyncProviders} from 'redux/actions';

import SettingsTable from './settingsTable';

class Settings extends React.Component <any, any>{
    constructor(props:any) {
        super(props);
    }

    componentDidMount() {
        this.props.dispatch(asyncProviders.updateSettings());
    }

    render() {
        return <SettingsTable options={this.props.settings} />;
    }
}

export default connect( (state: State) => {
    return {settings: state.settings};
})(withRouter(Settings));
