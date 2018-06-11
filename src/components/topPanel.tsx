import * as React from 'react';
import {fetch} from '../utils/fetch';

export default class TopPanel extends React.Component <any, any>{

    constructor(props: any){
        super(props);
        this.state = {status: false, ethBalance: 0, pscBalance: 0, ptcBalance: 0, pscCount: 0};
        this.update();
    }

    update(){

        const rate = this.props.rate ? this.props.rate : 3000;

        if(this.props.mode === 'agent'){
            setTimeout(this.updateAgent.bind(this), rate);
        }else{
            setTimeout(this.updateClient.bind(this), rate);
        }
    }

    updateAgent(){
        fetch('/channels?serviceStatus=active', {}).then(res => {
            const pscCount = (res as any).length;
            this.setState({status: pscCount > 0, pscCount });
        });

        fetch('/accounts/', {}).then(res => {
            const ethBalance = ((res as any).reduce((balance, account) => {
                return account.ethBalance + balance;
            }, 0)/1e18).toFixed(3);
            const ptcBalance = ((res as any).reduce((balance, account) => {
                return account.ptcBalance + balance;
            }, 0)/1e8).toFixed(3);
            const pscBalance = ((res as any).reduce((balance, account) => {
                return account.psc_balance + balance;
            }, 0)/1e8).toFixed(3);

            this.setState({ethBalance, ptcBalance, pscBalance});
            this.update();
        });
    }

    updateClient(){
        // coming soon
        this.update();
    }

    render(){

        const status = this.state.status ? 'on' : 'off';

        if(this.props.mode === 'agent'){
            return <ul className='list-inline float-right mb-0 topPanel'>
                <li className='list-inline-item'>ETH Balance: {this.state.ethBalance}</li>
                <li className='list-inline-item'>Exchange Balance: {this.state.ptcBalance}</li>
                <li className='list-inline-item'>Service balance: {this.state.pscBalance}</li>
                <li className='list-inline-item'>Active Services: {this.state.pscCount}</li>
                <li className='list-inline-item m-r-20 topPanelStatusLi'> Status: <span className={`statusWrap statusWrap-${status}`}><i className={`fa fa-toggle-${status}`}></i></span></li>
            </ul>;
        }else{
            return <ul className='list-inline float-right mb-0 topPanel'>
                <li className='list-inline-item'>ETH Balance: <span id='topPanelEthBalance'></span></li>
                <li className='list-inline-item'>Service balance: <span id='topPanelPSCBalance'></span></li>
                <li className='list-inline-item'>Total Traffic: <span id='topPanelTotalTraffic'></span></li>
                <li className='list-inline-item'>Traffic Balance: <span id='topPanelTrafficBalance'></span></li>
                <li className='list-inline-item m-r-20 topPanelStatusLi'> Status: <span className={`statusWrap statusWrap-${status}`}><i className={`fa fa-toggle-${status}`}></i></span></li>
            </ul>;
        }
    }
}
