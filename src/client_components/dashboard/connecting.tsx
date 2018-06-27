import * as React from 'react';
import {fetch} from '../../utils/fetch';
import ConfirmPopupSwal from '../../components/confirmPopupSwal';
import Countdown from 'react-countdown-now';
import ActiveConnection from '../connections/active';

    const countdownRender = ({ minutes, seconds }) => {
        return <span>{minutes}:{seconds}</span>;
    };

    const completeRemaining = () => {
        return <span>Waiting time is over. Finish procedure will be called automatically.</span>;
    };



export default class Connecting extends React.Component<any, any>{

    constructor(props:any){
        super(props);
        this.state = {status: 'pending', handler: 0, channels: []};
    }

    componentDidMount(){
        this.refresh();
    }

    componentWillUnmount(){
        if(this.state.handler !== 0){
            clearTimeout(this.state.handler);
        }
    }

    async refresh(){

        const pendingChannelsReq = fetch('/client/channels?serviceStatus=pending', {});
        const activeChannelsReq = fetch('/client/channels?serviceStatus=active', {});
        const suspendedChannelsReq = fetch('/client/channels?serviceStatus=suspended', {});
        const testReq = fetch('/client/channels?channelStatus=active', {});

        const [pendingChannels, activeChannels, suspendedChannels, test] = await Promise.all([pendingChannelsReq, activeChannelsReq, suspendedChannelsReq, testReq]);
        console.log('REFRESH!!!!', [pendingChannels, activeChannels, suspendedChannels, test]);

        if((activeChannels as any).length > 0){
            this.setState({status: 'active', channels: activeChannels});
        }else if((suspendedChannels as any).length > 0){
            // const usage = (await fetch(`/channel=${suspendedChannels[0].id}`)) as any;
            const channel = suspendedChannels[0];

            if(channel.usage.current > 0){
                this.setState({status: 'paused', channels: activeChannels});
            }else{
                this.setState({status: 'suspended', channels: suspendedChannels});
            }
        }else if((pendingChannels as any).length > 0){
            this.setState({status: 'pending', channels: pendingChannels});
        }

        this.setState({handler: setTimeout(this.refresh.bind(this), 3000)});
    }

    pending(){
        return <div className='container-fluid'>
            <div className='row m-t-20'>
                <div className='col-5'>
                    <div className='card m-b-20 card-body'>
                        <p className='card-text'>After the connection is ready, you can start using the VPN.</p>
                        <button className='btn btn-inverse btn-block btn-lg disabled'>
                            <span className='loadingIconBl'><i className='fa fa-spin fa-refresh'></i></span>Synchronizing...
                        </button>
                    </div>
                </div>
            </div>
            <ActiveConnection channels={this.state.channels}/>
        </div>;
    }

    suspended(){
        return <div className='container-fluid'>
            <div className='row m-t-20'>
                <div className='col-5'>
                    <div className='card m-b-20 card-body'>
                        <p className='card-text remainingText'>Remaining: <strong><Countdown date={new Date(Date.parse(this.state.channels[0].channelStatus.lastChanged) + this.state.channels[0].channelStatus.maxInactiveTime*1000)} renderer={countdownRender} onComplete={completeRemaining} /></strong> min</p>
                        <p className='card-text m-t-5 m-b-20 text-muted'>After max. inactivity time has been reached, "Finish procedure" will be called automatically.</p>
                        <ConfirmPopupSwal
                            endpoint={`/client/channels/${this.state.channels[0].id}/status`}
                            options={{method: 'put', body: {action: 'resume'}}}
                            title={'Resume'}
                            text={<span></span>}
                            class={'btn btn-primary btn-custom btn-block'}
                            swalType='warning'
                            swalConfirmBtnText='Yes, resume it!'
                            swalTitle='Are you sure?' />
                    </div>
                </div>

                <div className='col-2'></div>

                <div className='col-5'>
                    <div className='card m-b-20 card-body'>
                        <p className='card-text'>This operation will permanently finish VPN usage.</p>
                        <p className='card-text m-t-5 m-b-20'>Your remaining deposit will be returned approx. in 12 min.</p>
                        <ConfirmPopupSwal
                            endpoint={`/client/channels/${this.state.channels[0].id}/status`}
                            options={{method: 'put', body: {action: 'terminate'}}}
                            title={'Finish'}
                            text={<span>This operation will permanently finish VPN usage</span>}
                            class={'btn btn-danger btn-custom btn-block'}
                            swalType='danger'
                            swalConfirmBtnText='Yes, finish it!'
                            swalTitle='Are you sure?' />
                    </div>
                </div>
            </div>

            <ActiveConnection channels={this.state.channels}/>
        </div>;
    }

    active(){
        return <div className='container-fluid'>
            <div className='row m-t-20'>
                <div className='col-5'>
                    <div className='card m-b-20 card-body'>
                        <p className='card-text'>This operation will pause VPN usage.</p>
                        <p className='card-text m-t-5 m-b-20'>For this contract, max suspend time is 12 min</p>
                        <ConfirmPopupSwal
                            endpoint={`/client/channels/${this.state.channels[0].id}/status`}
                            options={{method: 'put', body: {action: 'pause'}}}
                            title={'Pause'}
                            text={<span>This operation will pause VPN usage.<br />
                            For this contract, max suspend time is 12 min.</span>}
                            class={'btn btn-primary btn-custom btn-block'}
                            swalType='warning'
                            swalConfirmBtnText='Yes, pause it!'
                            swalTitle='Are you sure?' />
                    </div>
                </div>

                <div className='col-2'></div>

                <div className='col-5'>
                    <div className='card m-b-20 card-body'>
                        <p className='card-text'>This operation will permanently finish VPN usage.</p>
                        <p className='card-text m-t-5 m-b-20'>Your remaining deposit will be returned approx. in 12 min.</p>
                        <ConfirmPopupSwal
                            endpoint={`/client/channels/${this.state.channels[0].id}/status`}
                            options={{method: 'put', body: {action: 'terminate'}}}
                            title={'Finish'}
                            text={<span>This operation will permanently finish VPN usage</span>}
                            class={'btn btn-danger btn-custom btn-block'}
                            swalType='danger'
                            swalConfirmBtnText='Yes, finish it!'
                            swalTitle='Are you sure?' />
                    </div>
                </div>
            </div>

            <ActiveConnection channels={this.state.channels}/>
        </div>;
    }

    paused(){
        return <div className='container-fluid'>
            <div className='row m-t-20'>
                <div className='col-5'>
                    <div className='card m-b-20 card-body'>
                        <p className='card-text remainingText'>Remaining: <strong><Countdown date={Date.parse(this.state.channels[0].channelStatus.lastChanged) + this.state.channels[0].channelStatus.maxInactiveTime*1000} renderer={countdownRender} onComplete={completeRemaining} /></strong> min</p>
                        <p className='card-text m-t-5 m-b-20 text-muted'>After max. inactivity time has been reached, "Finish procedure" will be called automatically.</p>
                        <ConfirmPopupSwal
                            endpoint={`/client/channels/${this.state.channels[0].id}/status`}
                            options={{method: 'put', body: {action: 'resume'}}}
                            title={'Resume'}
                            text={<span></span>}
                            class={'btn btn-primary btn-custom btn-block'}
                            swalType='warning'
                            swalConfirmBtnText='Yes, resume it!'
                            swalTitle='Are you sure?' />
                    </div>
                </div>

                <div className='col-2'></div>

                <div className='col-5'>
                    <div className='card m-b-20 card-body'>
                        <p className='card-text'>This operation will permanently finish VPN usage.</p>
                        <p className='card-text m-t-5 m-b-20'>Your remaining deposit will be returned approx. in 12 min.</p>
                        <ConfirmPopupSwal
                            endpoint={`/client/channels/${this.state.channels[0].id}/status`}
                            options={{method: 'put', body: {action: 'terminate'}}}
                            title={'Finish'}
                            text={<span>This operation will permanently finish VPN usage</span>}
                            class={'btn btn-danger btn-custom btn-block'}
                            swalType='danger'
                            swalConfirmBtnText='Yes, finish it!'
                            swalTitle='Are you sure?' />
                    </div>
                </div>
            </div>

            <ActiveConnection channels={this.state.channels}/>
        </div>;
    }

    render(){
        return this[this.state.status]();
    }
}
