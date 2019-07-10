export default async function(){
    const localSettings = JSON.parse(window.localStorage.getItem('localSettings'));
    const { supervisorEndpoint } = localSettings;
    try{
        await fetch(`${supervisorEndpoint}/stop`);
    }catch(e){
        console.log(e);
    }
}
