import toFixedN from './toFixedN';

export default function (amount: number): string {

    return amount ? toFixedN({number: amount, fixed: 2}) : '0';
}
