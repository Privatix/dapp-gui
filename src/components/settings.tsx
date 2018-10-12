import * as React from 'react';
import { withRouter } from 'react-router-dom';
import SettingsTable from './settingsTable';
import {connect} from 'react-redux';
import {State} from '../typings/state';

class Settings extends React.Component <any, any>{
    constructor(props:any) {
        super(props);
    }

    render() {
        return <SettingsTable options={this.props.settings} />;
    }
}

export default connect( (state: State) => {
    return {settings: state.settings};
})(withRouter(Settings));
