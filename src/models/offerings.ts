import { State } from 'typings/state';
import { Offering, ClientOfferingItem } from 'typings/offerings';

export default class Offerings {

    useUnlimitedOnly = false;
    private listeners = {};
    private offerings: ClientOfferingItem[] = [];
    private blackList: Offering[] = [];
    private ws;

    newOfferingSubscription;
    deleteOfferingSubscription;
    supplyChangeSubscription;

    constructor(ws: State['ws']){
        this.ws = ws;
    }

    async init(){
        await this.ws.whenAuthorized();
        const allOfferings = await this.ws.getClientOfferings('', 0, 0, [], [], 0, 0);
        const clientOfferings = allOfferings.items.filter(this.isProperOffering);
        this.offerings = clientOfferings;
        this.emit('*');
        this.subscribe();
    }

    async subscribe(){
        this.newOfferingSubscription = await this.ws.subscribe('offering', ['clientAfterOfferingMsgBCPublish'], this.onNewOffering);
        this.deleteOfferingSubscription = await this.ws.subscribe('offering', ['clientAfterOfferingDelete'], this.onDeleteOffering);
        this.supplyChangeSubscription = await this.ws.subscribe('offering', ['decrementCurrentSupply', 'incrementCurrentSupply'], this.onSupplyChange);
    }


    private onNewOffering = (evt: any) => {
        if(evt.job.Status !== 'done'){
            // TODO check fault?
            return;
        }

        if(evt.object.currentSupply <= 0){
            // TODO ?
            return;
        }

        this.addOffering({offering: evt.object, rating: 0});
        this.emit('newOffering');
    }

    private addOffering(offeringItem: ClientOfferingItem){
        this.offerings.push(offeringItem);
    }

    private onDeleteOffering = (evt: any) => {
        this.offerings = this.offerings.filter(item => item.offering.id !== evt.object.id);
        this.emit('deleteOffering');
        console.log('deleteOffering', evt);
    }

    private onSupplyChange = (evt: any) => {
        if(evt.object){
            const current = this.offerings.find(item => item.offering.id === evt.object.id);
            this.offerings = this.offerings.filter(item => item.offering.id !== evt.object.id);
            this.addOffering({offering: evt.object, rating: current ? current.rating : 0});
            this.emit('supplyChange');
        }
        console.log('supplyChange', evt);
    }

    private isProperOffering = (item: ClientOfferingItem) => {
        if(!item || !item.offering){
            return false;
        }
        return (this.blackList.findIndex(wreckOffering => wreckOffering.id === item.offering.id) === -1)
            && (item.offering.currentSupply > 0)
            && (!this.useUnlimitedOnly || !item.offering.maxUnit); // only unlimited offerings if useUnlimitedOnly == true
    }

    getOfferings(){
        return this.offerings.filter(item => !this.blackList.some(banned => banned.id === item.offering.id));
    }

    addToBlackList(offering: Offering){
        this.blackList.push(offering);
    }

    addEventListener(evtName: string, listener: Function){
        if(!this.listeners[evtName]){
            this.listeners[evtName] = [];
        }
        this.listeners[evtName].push(listener);
    }

    removeEventListener(evtName: string, listener: Function){
        if(!this.listeners[evtName]){
            return;
        }
        this.listeners[evtName] = this.listeners[evtName].filter(handler => handler !== listener);
    }

    private emit(evtName: string){
        console.log(evtName);
        if(this.listeners[evtName] && this.listeners[evtName].length){
            this.listeners[evtName].forEach(listener => listener());
        }
        if(evtName !== '*' && this.listeners['*'] && this.listeners['*'].length){
            this.listeners['*'].forEach(listener => listener());
        }
    }
}
