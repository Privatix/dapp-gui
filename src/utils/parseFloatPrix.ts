export default function (num: string) {

    const raw = num.split('.');

    if(raw.length === 1){
        return parseInt(raw[0], 10) * 1e8;
    }else if(raw.length === 2){
        if(raw[1].length < 8){
            return parseInt(`${raw[0]}${raw[1]}`, 10) * 10**(8-raw[1].length);
        }else{
            return parseInt(`${raw[0]}${raw[1].substr(0, 8)}`, 10);
        } 
    }else{
        return NaN;
    }
}
