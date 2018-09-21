import * as uuidv4 from 'uuid/v4';

export default class WS {

    
    static listeners = {}; // uuid -> listener
    static byUUID = {}; // uuid -> subscribeID
    static bySubscription = {}; // subscribeId -> uuid

    private socket: WebSocket;
    private pwd: string;

    constructor(endpoint: string) {

        const socket = new WebSocket(endpoint);

        socket.onopen = function() {
          // console.log('Connection established.');
        };

        socket.onclose = function(event: any) {
            if (event.wasClean) {
                console.log('Connection closed.');
            } else {
                console.log('Connection interrupted.');
            }
            console.log('Code: ' + event.code + ' reason: ' + event.reason);
        };

        socket.onmessage = function(event: any) {
            const msg = JSON.parse(event.data);
            if('id' in msg && 'string' === typeof msg.id){
                if('result' in msg && 'string' === typeof msg.result){
                    WS.byUUID[msg.id] = msg.result;
                    WS.bySubscription[msg.result] = msg.id;
                }
            }else if('method' in msg && msg.method === 'ui_subscription'){
                if(msg.params.subscription in WS.bySubscription){
                    WS.listeners[WS.bySubscription[msg.params.subscription]](msg.params.result);
                }
           } else {
               // ignore
           }
          // console.log('Data received: ' + event.data);
        };

        socket.onerror = function(error: any) {
          // console.log('Error ' + error.message);
        };

        this.socket = socket;
    }

    setPassword(pwd: string){
        this.pwd = pwd;
    }

    subscribe(entityType:string, ids: string[], handler: Function) {
        const uuid = uuidv4();
        const req = {
            jsonrpc: '2.0',
            id: uuid,
            method: 'ui_subscribe',
            params: ['objectChange', this.pwd, entityType, ids]
        };
        WS.listeners[uuid] = handler;
        this.socket.send(JSON.stringify(req));
        return uuid;
    }

    unsubscribe(id: string){

        const uuid = uuidv4();

        if(WS.listeners[id]){
            const req = {
                jsonrpc: '2.0',
	            id: uuid,
	            method: 'ui_unsubscribe',
	            params: [ WS.byUUID[id] ]
            };
            this.socket.send(JSON.stringify(req));
            delete WS.listeners[id];
            delete WS.bySubscription[WS.byUUID[id]];
            delete WS.byUUID[id];
        }
    }
}
