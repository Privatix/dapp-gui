import * as React from 'react';
import {fetch} from 'utils/fetch';
import { withRouter } from 'react-router-dom';
import {asyncReactor} from 'async-reactor';
import ChannelsListPure from './channelsListPure';

function Loader() {

  return (<b>Loading channels ...</b>);

}

const AsyncChannels = async function(props: any){
        console.log('AsyncChannels!!!', props);
        const endpoint = `/channels?serviceStatus=${props.status}`;

        const channels = await fetch(endpoint, {method: 'GET'});

        return <ChannelsListPure channels={channels} />;
    };

interface Props {
    status: string;
    history: any;
    match: any;
}
class Channels extends React.Component<Props, any> {
    constructor(props: Props) {
        super(props);
        this.state = {status: props.status};
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: any){
        console.log('PROPS!!!', nextProps, prevState);
        return {status: nextProps.match.params.status ? nextProps.match.params.status : prevState.status};
    }

    render (){
        const Helper = asyncReactor(AsyncChannels, Loader);
        console.log('RENDER!!!', this.state.status);
        return <Helper status={this.state.status} />;
    }
}

export default withRouter(Channels);
