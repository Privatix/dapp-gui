import toFixedN from './toFixedN';

export default function(usage: number){
        switch(true) {
            case usage < 1024:
                return {value: toFixedN({number: usage, fixed: 2}), unit: 'MB'};
            case usage < 1024*1024:
                return {value: toFixedN({number: usage/(1024), fixed: 2}), unit: 'GB'};
            default:
                return {value: toFixedN({number: usage/(1024*1024), fixed: 2}), unit: 'TB'};
        }
}
