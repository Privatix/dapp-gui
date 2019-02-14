import * as React from 'react';

import { WS, ws } from 'utils/ws';

import SettingsTable from './settingsTable';

interface IProps {
    ws?: WS;
}

interface IState {
    settings: any;
}

class Settings extends React.Component <IProps, IState>{

    constructor(props:IProps) {
        super(props);
        this.state = {settings: {}};
    }

    async componentDidMount() {
        const { ws } = this.props;
        const settings = await ws.getSettings();
        this.setState({settings});
    }

    render() {
        return <SettingsTable options={this.state.settings} />;
    }
}

export default ws<IProps>(Settings);
