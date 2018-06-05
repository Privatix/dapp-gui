import * as React from 'react';
import {asyncReactor} from 'async-reactor';
import ConfirmPopupSwal from '../../components/confirmPopupSwal';
import Countdown from 'react-countdown-now';
import ActiveConnection from '../connections/active';

function Loader() {
    return (<h2>Loading data ...</h2>);
}

async function AsyncActive (props:any){
    const timeEnd = 720000;

    const countdownRender = ({ minutes, seconds }) => {
        return <span>{minutes}:{seconds}</span>;
    };

    const completeRemaining = () => {
        console.log('Completed', 777);
    };

    return <div className='container-fluid'>
        <div className='row m-t-20'>
            <div className='col-5'>
                <div className='card m-b-20 card-body'>
                    <p className='card-text remainingText'>Remaining: <strong><Countdown date={Date.now() + timeEnd} renderer={countdownRender} onComplete={completeRemaining} /></strong> min</p>
                    <p className='card-text m-t-5 m-b-20 text-muted'>After max. inactivity time has been reached, "Finish procedure" will be called automatically.</p>
                    <ConfirmPopupSwal
                        endpoint={`/`}
                        options={{method: 'get'}}
                        title={'Resume'}
                        text={<span></span>}
                        class={'btn btn-primary btn-custom btn-block'}
                        swalType='warning'
                        swalConfirmBtnText='Yes, resume it!'
                        swalTitle='Are you sure?' />
                </div>
            </div>

            <div className='col-2'></div>

            <div className='col-5'>
                <div className='card m-b-20 card-body'>
                    <p className='card-text'>This operation will permanently finish VPN usage.</p>
                    <p className='card-text m-t-5 m-b-20'>Your remaining deposit will be returned approx. in 12 min.</p>
                    <ConfirmPopupSwal
                        endpoint={`/`}
                        options={{method: 'put', body: {action: 'remove'}}}
                        title={'Finish'}
                        text={<span>This operation will permanently finish VPN usage</span>}
                        class={'btn btn-danger btn-custom btn-block'}
                        swalType='danger'
                        swalConfirmBtnText='Yes, finish it!'
                        swalTitle='Are you sure?' />
                </div>
            </div>
        </div>

        <ActiveConnection />
    </div>;
}

export default asyncReactor(AsyncActive, Loader);
