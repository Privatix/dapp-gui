import * as React from 'react';
import ChannelsListByStatus from './channelsListByStatus';

export default class ChannelsByStatus extends React.Component <any,any> {

    constructor(props: any) {
        super(props);

        this.state = {
            status: props.status,
            refresh: null
        };
    }

    static getDerivedStateFromProps(props:any, state:any) {
        return {status: props.status};
    }

    refresh() {
        if ('function' === typeof this.state.refresh) {
            this.state.refresh();
        }
    }

    registerRefresh(refresh:Function) {
        this.setState({refresh});
    }

    render() {
        const status = this.state.status;

        return <div className='container-fluid'>
            <div className='row'>
                <div className='col-sm-12 m-b-15'>
                    <h3 className='page-title'>{status === 'active' ? 'Active Services' : 'History'}</h3>
                </div>
            </div>
            <div className='row'>
                <div className='col-sm-12 m-b-15'>
                    <div className='m-t-15'>
                        <button className='btn btn-default btn-custom waves-effect waves-light' onClick={this.refresh.bind(this)}>Refresh</button>
                    </div>
                </div>
            </div>
            <ChannelsListByStatus status={status} registerRefresh={this.registerRefresh.bind(this)} />
        </div>;
    }
}
