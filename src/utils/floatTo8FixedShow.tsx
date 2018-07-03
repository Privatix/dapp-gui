export default function (props: any) {
    const number = props.number;

    return (Math.floor(number) !== number ? number.toFixed(8).replace(/0+$/, '') : number);
}
