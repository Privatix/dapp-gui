export default function (props: any): string {

    const { number, significant } = props;
    let fixed = props.fixed;

    const leaveSignificant = function(str: string, significant: number){
        if(!(/\.[0-9]+/.test(str))){
            return str;
        }
        if(!significant){
            return str;
        }
        const chunks = str.split('.');
        const notZeros = chunks[1].replace(/^0+/, '').length;
        if(notZeros <= significant){
            return str;
        }else{
            return chunks[0] + '.' + chunks[1].split('').slice(0, chunks[1].length-(notZeros-significant)).join('');
        }
    };

    if (typeof number === 'undefined' || number === null || isNaN(number)) {
        return '0';
    }

    if (typeof fixed === 'undefined' || fixed === null || isNaN(fixed)) {
        fixed = 0;
    }

    const isHaveDecimals = Math.floor(number) !== number;

    if(isHaveDecimals){
       const res = number.toFixed(fixed).replace(/0+$/, '').replace(/\.$/, '');
       return leaveSignificant(res, significant);
    }else{
        return String(number);
    }
}
