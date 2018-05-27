import * as React from 'react';

export default function gasRange(props: any) {
/*
    const changeGasPrice = () => {
        (document.getElementById('gasPrice') as HTMLInputElement).innerHTML = (document.getElementById('gasRange') as HTMLInputElement).value;
    };
*/
    return <input className='form-control' id='gasRange' onChange={props.onChange} type='range' name='range' min='0' max='20'/>;
}
