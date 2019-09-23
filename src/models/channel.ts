import { State } from 'typings/state';
import { Mode } from 'typings/mode';
import { ClientChannel, ClientChannelUsage } from 'typings/channels';

export type Status = 'disconnected'
            | 'disconnecting'
            | 'connected'
            | 'connecting'
            | 'resuming'
            | 'pingLocations'
            | 'pingFailed'
            | 'suspended'
            ;

export default class Channel {
    private ws: State['ws'];
    public model: ClientChannel;
    private ip: string;
    private usage: ClientChannelUsage;
    private sessionsDuration: number = 0;
    private checkIpAttempt: number;
    private status: Status = 'disconnected';
    private listeners = [];
    // subscriptions
    public newChannelSubscription: string; // временно public
    public channelSubscription: string; // временно public
    public usageSubscription: any; // временно public

    private mode: 'advanced' | 'simple'; // надо от этого избавляться, мы не хотим тут знать про режимы
    // мы хотим имет набор свойств, а каждый режим их задает как ему нужно

    public reconnect = false;

    constructor(ws: State['ws']){
        this.ws = ws;
        this.checkIpAttempt = 0;
        this.subscribeOnNewChannel();
        this.checkChannels();
        
    }

    async checkChannels(){
        const ws = this.ws;
        const channels = await ws.getNotTerminatedClientChannels();
        console.log('CHANNELS!!!', channels);
        if(channels.length){
            if(this.model){
                // пока шел ответ уже создался канал
                // тут думать как реагировать
            }else{
                const id = await ws.subscribe('channel', [channels[0].id], this._onChannelChanged);
                this.checkStatus(channels[0]);
                
                this.channelSubscription = id;
            }
        }
    }

    async subscribeOnNewChannel(){
        const id = await this.ws.subscribe('channel', ['clientPreChannelCreate'], this._onChannelCreated);
        this.newChannelSubscription = id;
    }

    getIp(){
        return this.ip;
    }

    getStatus(){
        return this.status;
    }

    getJob(){
        return this.model ? this.model.job : null;
    }

    getUsage(){
        return this.usage;
    }

    getSessionsDuration(){
        return this.sessionsDuration;
    }

    private async setSessionsDuration(){

        const sessions = await this.ws.getSessions(this.model.id);
        const sessionsDuration = sessions.reduce((res, session) => {
            if(session.started === null){
                return res;
            }
            if(session.stopped === null){
                return res + Date.now() - Date.parse(session.started);
            }
            return res + Date.parse(session.stopped) - Date.parse(session.started);
        }, 0);
        this.sessionsDuration = sessionsDuration;
        this.emit('UsageChanged');
    }

    private subscribeUsage(){
        if(this.usageSubscription){
            clearTimeout(this.usageSubscription);
        }
        this.usageSubscription = setTimeout(this.usageHandler, 3000);
        this.usageHandler();
    }

    usageHandler = async () => {
        if(this.model){
            const usage = await this.ws.getChannelsUsage([this.model.id]);
            if(this.model && this.model.id in usage){
                this.usage = usage[this.model.id];
                this.emit('UsageChanged');
            }
            this.usageSubscription = setTimeout(this.usageHandler, 3000);
        }
    }

    private checkIp = async () => {
        if(this.checkIpAttempt < 5){
            try{
                const res = await fetch('https://api.ipify.org?format=json');
                const json = await res.json();
                if(this.ip !== json.ip){
                    this.ip = json.ip;
                    this.emit('ipChanged');

                    this.checkIpAttempt = 0;
                }
            }catch(e){
                this.checkIpAttempt += 1;
                setTimeout(this.checkIp, 3000);
            }
        }else{
            // TODO не удалось получить ip
        }
    }

    setMode(mode: 'advanced' | 'simple'){
        this.mode = mode;
    }

    async acceptOffering(offeringId: string, account: any, deposit: any, gasPrice: any){
        if(this.model){
            throw new Error('already created channel');
        }else{
            // тут создаем канал и отслеживаем его статус
            try{
                const acceptRes = await this.ws.acceptOffering(account.ethAddr, offeringId, deposit, gasPrice);
                if(typeof acceptRes === 'string') {
                    // тут дергаем onAcceptOffering
                }else{
                    // тут дергаем onAcceptOfferingFailed
                }
            }catch(e){
                // тут дергаем onAcceptOfferingFailed
            }
        }
    }

    private _onChannelCreated = async (evt: any) => {
        // наш обработчик на создание канала
        // подписываемся на созданный канал
        // запускаем поллинг usage
        console.log('NEW CHANNEL!!!', evt);
        await this.checkChannels();
        /*
        if(this.mode === 'simple'){
            this.resume();
        }
       */
    }

    onChannelCreated(){
        // ставим свой хук на создание канала
        // тут думать что делать с прежним
        // сколько хуков может быть?
    }

    private _onChannelChanged = async (evt: any) => {
        console.log('CHANNEL CHANGED!!!', evt);
        // наш обработчик изменений канала
        // в том числе сбрасывает данные если канал закрылся

        // const channel = evt.object;
        // в симпл моде и при нулевом балансе мы должны сделать uncooperative close
        // после закрытия канала
        // делаем это отдельным "потоком"
        // так как пока это происходит может быть создан новый канал
        if(evt.object.serviceStatus === 'terminated'){
            this.status = 'disconnected';
            if(this.channelSubscription){
                this.ws.unsubscribe(this.channelSubscription);

                this.channelSubscription = null;
                this.model = null;
            }
            this.emit('StatusChanged');
        }else{
            const channel = await this.ws.getNotTerminatedClientChannels();
            console.log('CHANNEL?', channel);
            if(channel.length){
                this.checkStatus(channel[0]);
            }
        }
    }

    checkStatus(channel: ClientChannel){
        console.log('CHECK STATUS!!!', channel);
        const model = this.model;
        this.model = channel;

        if(!model || model.job.jobtype !== channel.job.jobtype){
            this.emit('StatusChanged');
        }
        if(!this.ip){
            this.checkIp();
        }

        const startWatchingClosing = async (channelId: string) => {

            const ws = this.ws;
            const Watcher = class {
                private _subscriptionId = null;
                private unsubscribe = false;

                get subscriptionId(){
                    return this._subscriptionId;
                }

                set subscriptionId(id: string){
                    this._subscriptionId = id;
                    if(this.unsubscribe){
                        ws.unsubscribe(id);
                    }
                }

                checkIfComplete = (evt: any) => {
                    if(evt.object.serviceStatus === 'terminated' && evt.object.channelStatus === 'active'){
                        ws.changeChannelStatus(evt.object.id, 'close');
                        if(this.subscriptionId){
                            ws.unsubscribe(this.subscriptionId);
                        }else{
                            this.unsubscribe = true;
                        }
                    }
                }
            };
            const watcher = new Watcher();
            watcher.subscriptionId = await ws.subscribe('channel', [channelId], watcher.checkIfComplete);
        };

        if(channel.channelStatus.serviceStatus === 'terminating' && this.mode === Mode.SIMPLE){
            if((channel as any).receiptBalance === 0){
                startWatchingClosing(channel.id);
            }
        }
        switch(channel.channelStatus.serviceStatus){
            case 'active':
                if(model && model.channelStatus.serviceStatus !== 'active'){
                    this.emit('Connected');
                }
                if(this.status !== 'connected'){
                    this.status = 'connected';
                    this.checkIp();
                    this.subscribeUsage();
                    this.setSessionsDuration();
                    this.emit('StatusChanged');
                }
                break;
            case 'pending':
            case 'activating':
                if(this.status !== 'connecting'){
                    this.status = 'connecting';
                    this.emit('StatusChanged');
                }
                break;
            case 'suspending':
            case 'suspended':
                switch(this.status){
                    case 'connecting':
                        if(this.mode === 'simple'){
                            this.status = 'resuming';
                            this.resume();
                            this.emit('StatusChanged');
                        }else{
                            this.status = 'suspended';
                            this.emit('StatusChanged');
                        }
                        break;
                    case 'connected':
                        this.status = 'suspended';
                        this.emit('StatusChanged');
                        /*
                        if(this.reconnect){
                            this.reconnectHandler();
                        }
                       */
                        break;
                    case 'resuming':
                    case 'disconnecting':
                        break;
                    default:
                        if(this.status !== 'suspended'){
                            this.status = 'suspended';
                            this.emit('StatusChanged');
                        }
                }
                break;
            case 'terminating':
                if(this.status !== 'disconnecting'){
                    this.status = 'disconnecting';
                    this.emit('StatusChanged');
                }
                break;
        }
    }

    async terminate(){
        if(!this.model){
            throw new Error('there is no channel');
        }
        try{
            await this.ws.changeChannelStatus(this.model.id, 'terminate');
            this.status = 'disconnecting';
            this.usage = null;
            this.sessionsDuration = 0;
            this.emit('StatusChanged');
        }catch(e){
            // onTerminateFailed
        }
    }

    async close(){
        if(!this.model){
            throw new Error('there is no channel');
        }
        try{
            await this.ws.changeChannelStatus(this.model.id, 'close');
        }catch(e){
            // TODO onCloseFailed
        }
    }

    async resume(){
        if(!this.model){
            throw new Error('there is no channel');
        }
        try{
            await this.ws.changeChannelStatus(this.model.id, 'resume');
        }catch(e){
            // TODO onResumeFailed
        }
    }

    addEventListener(evtName: string, listener: Function){
        this.listeners[evtName] = listener;
    }

    private emit(evtName: string){
        console.log(evtName);
        if(this.listeners[evtName]){
            this.listeners[evtName]();
        }
    }

    reconnectHandler(){
        // 
    }
}
