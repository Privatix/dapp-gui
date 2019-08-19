import toFixedN from './toFixedN';

export default function (amount: number): string {

    return toFixedN({number: amount/1e9, fixed: 8, significant: 2});
}
