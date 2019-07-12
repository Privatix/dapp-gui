import * as React from 'react';
import { connect } from 'react-redux';

import {State} from 'typings/state';

interface Props {
    localSettings?: State['localSettings'];
    settings?: State['settings'];
    className?: string;
}

class NetworkAndVersion extends React.Component <Props, {}>{

    render() {

        const { localSettings, settings, className } = this.props;
        let network = localSettings.network;
        network = network.charAt(0).toUpperCase() + network.slice(1);

        return <div className={`networkANdBuildVersion ${className}`}>{network}: {settings['system.version.app']}</div>;
    }
}

export default connect( (state: State) => ({localSettings: state.localSettings, settings: state.settings}) )(NetworkAndVersion);
