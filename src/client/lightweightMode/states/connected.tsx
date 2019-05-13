import * as React from 'react';
import { translate } from 'react-i18next';

import SelectCountry from '../selectCountry/';

import toFixed from 'utils/toFixedN';

import { Offering } from 'typings/offerings';
import { ClientChannel, ClientChannelUsage } from 'typings/channels';

interface SelectItem {
    value: string;
    label: string;
}

interface IProps {
    t?: any;
    ip: string;
    selectedLocation: SelectItem;
    channel: ClientChannel;
    usage: ClientChannelUsage;
    offering: Offering;
    onChangeLocation: Function;
    onDisconnect(event: any): void;
}

interface IState {
    startPoint: number;
    tick: number;
}

@translate(['client/simpleMode'])
export default class Connected extends React.Component<IProps, IState> {

    private tickerHandler = null;

    constructor(props: IProps){
        super(props);
        const { channel } = props;
        const startPoint = Math.floor((Date.parse(channel.job.createdAt) + (new Date().getTimezoneOffset()*60*1000))/1000);
        this.state = {startPoint, tick: 0};
    }
    componentDidMount(){
        this.startTicker();
    }

    componentWillUnmount(){
        this.stopTicker();
    }

    startTicker = () => {
        const { startPoint } = this.state;
        const tick = Math.floor(Date.now()/1000) - startPoint;
        this.setState({tick});
        this.tickerHandler = setTimeout(this.startTicker, 1000);
    }

    stopTicker(){
        if(this.tickerHandler){
            clearTimeout(this.tickerHandler);
        }
        this.tickerHandler = null;
    }

    render(){

        const { t, usage, ip, selectedLocation, offering, onChangeLocation, onDisconnect } = this.props;
        const { tick } = this.state;

        const padZero = (n: number) => n < 10 ? `0${n}` : `${n}`;

        const seconds = tick%60;
        const minutes = ((tick - seconds)/60)%60;
        const hours = (tick - minutes*60 - seconds)/(60*60);

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
                <button type='button' onClick={onDisconnect} className='btn btn-primary btn-custom btn-rounded waves-effect waves-light spacing'>
                    {t('Disconnect')}
                </button>
                <ul className='list-inline m-t-15 spacing'>
                    <li>
                        <h6 className='text-muted' style={ {marginTop: '0px'} }>{t('TIME')}</h6>
                        <h2 className='m-t-20'>{padZero(hours)}:{padZero(minutes)}:{padZero(seconds)}</h2>
                        <h4 className='text-muted  m-b-0'>hh:mm:ss</h4>
                    </li>
                    <li>
                        <h6 className='text-muted' style={ {marginTop: '0px'} }>{t('TRAFFIC')}</h6>
                        <h2 className='m-t-20'>{usage ? usage.current : null}</h2>
                        <h4 className='text-muted m-b-0'>MB</h4>
                    </li>
                    <li>
                        <h6 className='text-muted' style={ {marginTop: '0px'} }>{t('SPENT')}</h6>
                        <h2 className='m-t-20'>{usage ? toFixed({number: usage.cost/1e8, fixed: 4}) : null}</h2>
                        <h4 className='text-muted m-b-0'>PRIX</h4>
                    </li>
                </ul>
            </>
        );
    }
}
