export default function (props: any): string {
    const number = props.number;
    let fixed = props.fixed;

    if (typeof number === 'undefined' || number === null || isNaN(number)) {
        return '0';
    }

    if (typeof fixed === 'undefined' || fixed === null || isNaN(fixed)) {
        fixed = 0;
    }

    const isHaveDecimals = Math.floor(number) !== number;

    return isHaveDecimals ? number.toFixed(fixed).replace(/0+$/, '').replace(/\.$/, '') : String(number);
}
