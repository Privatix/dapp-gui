import * as React from 'react';
import { connect } from 'react-redux';

import {State} from 'typings/state';

interface Props {
    localSettings?: State['localSettings'];
    className?: string;
}

class NetworkAndVersion extends React.Component <Props, {}>{

    render() {

        const { localSettings, className } = this.props;
        let network = localSettings.network;
        network = network.charAt(0).toUpperCase() + network.slice(1);

        return <div className={`networkANdBuildVersion ${className}`}>{network}: {localSettings.release}</div>;
    }
}

export default connect( (state: State) => ({localSettings: state.localSettings}) )(NetworkAndVersion);
