export default function (props: any) {
    const number = props.number;

    if (typeof number === 'undefined' || number === null) {
        return 0;
    }

    const isHaveDecimals = Math.floor(number) !== number;

    return isHaveDecimals ? number.toFixed(8).replace(/0+$/, '') : number;
}
