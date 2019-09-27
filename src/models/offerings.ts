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
        console.log('newOffering', evt);

        if(evt.job.Status !== 'done'){
            // TODO проверять fail?
            return;
        }

        if(evt.object.currentSupply <= 0){
            // TODO вычеркивать из списка?
            return;
        }

        this.addOffering({offering: evt.object, rating: 0});
        this.emit('newOffering');
    }

    private addOffering(offeringItem: ClientOfferingItem){
        this.offerings.push(offeringItem);
    }

    private onDeleteOffering = (evt: any) => {
        this.emit('deleteOffering');
        console.log('deleteOffering', evt);
    }

    private onSupplyChange = (evt: any) => {
        this.emit('supplyChange');
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
        // TODO фильтровать по черному списку
        return this.offerings;
    }

    addToBlackList(offering: Offering){
        this.blackList.push(offering);
    }

    addEventListener(evtName: string, listener: Function){
        this.listeners[evtName] = listener;
    }

    private emit(evtName: string){
        console.log(evtName);
        if(evtName !== '*' && this.listeners[evtName]){
            this.listeners[evtName]();
        }
        if(this.listeners['*']){
            this.listeners['*']();
        }
    }
}
