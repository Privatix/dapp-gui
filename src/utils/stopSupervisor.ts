import * as log from 'electron-log';

export default async function(){
    const localSettings = JSON.parse(window.localStorage.getItem('localSettings'));
    const { supervisorEndpoint } = localSettings;
    try{
        await fetch(`${supervisorEndpoint}/stop`);
    }catch(e){
        log.error(e);
    }
}
