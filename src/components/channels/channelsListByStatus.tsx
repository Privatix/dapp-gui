import * as React from 'react';
import {fetch} from '../../utils/fetch';
import ChannelsListPure from './channelsListPure';

interface Props {
    status: string;
}

class Channels extends React.Component<Props, any> {

    constructor(props: Props) {
        super(props);
        this.state = {status: props.status, channels: {active: [], terminated: []}, handler: 0};
    }

    componentDidMount(){
        this.refresh();
    }

    componentWillUnmount(){
        if(this.state.handler){
            clearTimeout(this.state.handler);
        }
    }

    async refresh(){
        const endpoint = `/channels/?serviceStatus=active`;
        const active = await fetch(endpoint, {});
        const terminatedEndPoint = `/channels/?serviceStatus=terminated`;
        const terminated = await fetch(terminatedEndPoint, {});

        this.setState({channels: {active, terminated}, handler: setTimeout(this.refresh.bind(this), 3000)});
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: any){
        return {status: nextProps.status ? nextProps.status : prevState.status};
    }

    render (){
        return <ChannelsListPure channels={this.state.channels[this.state.status]} />;
    }
}

export default Channels;
