import * as React from 'react';

export default class JobStatus extends React.Component<any, any>{

    constructor(props: any){
        super(props);
    }

    get aliases() {
        return {
            'agentAfterChannelCreate': 'create service entry' // 'channel create'
           ,'agentAfterUncooperativeCloseRequest' : 'react on contract dispute' // uncooperative close request'
           ,'agentAfterCooperativeClose' : 'finalize contract close' // 'cooperative close'
           ,'agentPreServiceTerminate' : 'close service and request payment withdrawal' // 'preparing service terminate'
           ,'agentPreEndpointMsgCreate' : 'prepare service access' // 'preparing endpoint message create'
           ,'agentPreEndpointMsgSOMCPublish' : 'publish service access message' // 'preparing endpoint message SOMC publish'
           ,'agentAfterEndpointMsgSOMCPublish' : 'activate service' // 'endpoint message SOMC publish'
           ,'agentPreOfferingMsgBCPublish' : 'send offering deposit' // 'preparing endpoint message blockchain publish'
           ,'agentAfterOfferingMsgBCPublish' : 'offering deposit placed' // 'endpoint message blockchain publish'
           ,'agentPreOfferingMsgSOMCPublish' : 'publish offering message' // 'preparing offering message SOMC publish'
           ,'agentPreOfferingPopUp' : 'request offering popup' // 'preparing offering pop up'
           ,'agentAfterOfferingPopUp' : 'finalize offering popup' // 'offering pop up'
           ,'agentPreOfferingDelete' : 'request offering remove and return deposit' // 'preparing offering delete'
           ,'agentAfterOfferingDelete' : 'finalize offering remove' // 'offering delete'

           ,'clientAfterOfferingMsgBCPublish' : 'get offering data'
           ,'clientPreChannelCreate': 'place service deposit' // 'preparing channel create'
           ,'clientAfterChannelCreate': 'update service data'
           ,'clientPreEndpointMsgSOMCGet' : 'get service access data' // 'preparing endpoint message SOMC get'
           ,'clientAfterEndpointMsgSOMCGet' : 'finalize service setup' // 'endpoint message SOMC get'
           ,'clientPreServiceTerminate' : 'close service and request payment withdrawal'
           ,'clientAfterUncooperativeCloseRequest' : 'open contract dispute' // uncooperative close request'
           ,'clientPreUncooperativeClose': 'get deposit back after challenge period' // 'preparing uncooperative close request'
           ,'clientAfterUncooperativeClose' : 'finalize dispute and contract close' // 'uncooperative close'
           ,'clientAfterCooperativeClose' : 'finalize contract close' // 'cooperative close'
           ,'clientAfterOfferingPopUp' : 'update offering position' // 'offering pop up'
           ,'clientAfterOfferingDelete' : 'remove offering' // 'offering delete'

           ,'preAccountAddBalanceApprove' : 'aproving token transfer to service account' // 'preparing account add balance approve'
           ,'preAccountAddBalance' : 'add balance to service account' // 'preparing account add balance'
           ,'aterAccountAddBalance' : 'update balance on service account' // 'account add balance'
           ,'preAccountReturnBalance' : 'request token transfer to ERC20 account' // 'preparing account return balance'
           ,'afterAccountReturnBalance' : 'update balance on ERC20 account' // 'account return balance'
           ,'AccountUpdateBalances' : 'check and update account balance info' // 'account update balances'

       /*
           ,'PreChannelTopUp': 'preparing channel top up'
           ,'AfterChannelTopUp': 'channel top up'
           ,'PreCooperativeClose' : 'preparing uncooperative close'
           ,'PreServiceSuspend' : 'preparing cooperative close'
           ,'PreServiceUnsuspend' : 'preparing service unsuspend'
       */

        };
    }

    render() {
        // const jobtype = this.props.jobtype.replace(/^(client|agent)/, '');

        return <span>
                {this.props.jobtype in this.aliases ? this.aliases[this.props.jobtype] : 'unknown job type'}
            </span>;

    }
}
