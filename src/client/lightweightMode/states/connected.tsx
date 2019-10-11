import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import SelectCountry from '../selectCountry/';
import DotProgress from 'common/progressBars/dotProgress';

import prix from 'utils/prix';
import mb from 'utils/mb';

import { Offering } from 'typings/offerings';
import { ClientChannelUsage } from 'typings/channels';
// import Channel from 'models/channel';

interface SelectItem {
    value: string;
    label: string;
}

interface IProps extends WithTranslation {
    selectedLocation: SelectItem;
    // channel: Channel;
    ip: string;
    usage: ClientChannelUsage;
    offering: Offering;
    sessionsDuration: number;
    onChangeLocation: Function;
    onDisconnect(event: any): void;
}

interface IState {
    startPoint: number;
    tick: number;
    disconnecting: boolean;
}

const translate = withTranslation(['client/simpleMode']);

class Connected extends React.Component<IProps, IState> {

    private tickerHandler = null;

    constructor(props: IProps){
        super(props);
        this.state = {startPoint: 0, tick: 0, disconnecting: false};
    }

    static getDerivedStateFromProps(props: IProps, state: IState){
        const { sessionsDuration } = props;
        const { startPoint } = state;
        return sessionsDuration !== 0 && startPoint === 0
            ? {startPoint: Date.now() - sessionsDuration}
            : null;
    }

    componentDidMount(){
        this.startTicker();
    }

    componentWillUnmount(){
        this.stopTicker();
    }

    startTicker = () => {
        const el = document.getElementById('connectedTime');
        el.innerHTML = this.getTime();
        this.tickerHandler = setTimeout(this.startTicker, 1000);
    }

    stopTicker(){
        if(this.tickerHandler){
            clearTimeout(this.tickerHandler);
        }
        this.tickerHandler = null;
    }

    onDisconnect = (evt: any) => {
        const { onDisconnect } = this.props;
        this.setState({disconnecting: true});
        onDisconnect(evt);
    }

    getTime(){
        const { startPoint } = this.state;

        const _tick = startPoint === 0 ? 0 : Date.now() - startPoint;

        const padZero = (n: number) => n < 10 ? `0${n}` : `${n}`;

        const tick = Math.floor(_tick/1000);
        const seconds = tick%60;
        const minutes = ((tick - seconds)/60)%60;
        const hours = (tick - minutes*60 - seconds)/(60*60);
        return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
    }

    render(){

        const { t, usage, ip, selectedLocation, offering, onChangeLocation } = this.props;
        const { disconnecting } = this.state;
        const traffic = usage ? mb(usage.current) : null;
        const timer = this.getTime();

        return (
            <>
                <h6 className='text-muted spacing'>IP: {ip}</h6>
                <div className='content clearfix content-center spacing'>
                    <SelectCountry onSelect={onChangeLocation}
                                   selectedLocation={selectedLocation}
                                   disabled={true}
                                   offering={offering}
                    />
                </div>
                <button type='button'
                        onClick={this.onDisconnect}
                        disabled={disconnecting}
                        className='btn btn-primary btn-custom btn-rounded waves-effect waves-light spacing'
                >
                    {disconnecting ? <>{t('Disconnecting')} <DotProgress /></> : t('Disconnect') }
                </button>
                <ul className='list-inline m-t-15 spacing'>
                    <li>
                        <h6 className='text-muted' style={ {marginTop: '0px'} }>{t('TIME')}</h6>
                        <h2 className='m-t-20' id='connectedTime' >{timer}</h2>
                        <h4 className='text-muted  m-b-0'>hh:mm:ss</h4>
                    </li>
                    <li>
                        <h6 className='text-muted' style={ {marginTop: '0px'} }>{t('TRAFFIC')}</h6>
                        <h2 className='m-t-20'>{usage ? traffic.value : null}</h2>
                        <h4 className='text-muted m-b-0'>{usage ? traffic.unit : null}</h4>
                    </li>
                    <li>
                        <h6 className='text-muted' style={ {marginTop: '0px'} }>{t('SPENT')}</h6>
                        <h2 className='m-t-20'>{usage ? prix(usage.cost) : null}</h2>
                        <h4 className='text-muted m-b-0'>PRIX</h4>
                    </li>
                </ul>
            </>
        );
    }
}

export default translate(Connected);
