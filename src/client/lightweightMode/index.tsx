import * as React from 'react';

import  SwitchAdvancedModeButton from './switchAdvancedModeButton';
// import { connect } from 'react-redux';

interface IProps {
}

export default class LightWeightClient extends React.Component<IProps, {}> {

    render(){
        return <div>Lighweight mode<br />
            <SwitchAdvancedModeButton />
        </div>;
    }
}
