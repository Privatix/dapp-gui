import * as React from 'react';

export default class JobStatus extends React.Component<any, any>{

    constructor(props: any){
        super(props);
    }

    get aliases() {
        return {
            'PreChannelCreate': 'preparing channel create'
           ,'AfterChannelCreate': 'channel create'
           ,'PreChannelTopUp': 'preparing channel top up'
           ,'AfterChannelTopUp': 'channel top up'
           ,'AfterUncooperativeCloseRequest' : 'uncooperative close request'
           ,'PreUncooperativeClose': 'preparing uncooperative close request'
           ,'AfterUncooperativeClose' : 'uncooperative close'
           ,'PreCooperativeClose' : 'preparing uncooperative close'
           ,'AfterCooperativeClose' : 'cooperative close'
           ,'PreServiceSuspend' : 'preparing cooperative close'
           ,'PreServiceUnsuspend' : 'preparing service unsuspend'
           ,'PreServiceTerminate' : 'preparing service terminate'
           ,'PreEndpointMsgCreate' : 'preparing endpoint message create'
           ,'PreEndpointMsgSOMCPublish' : 'preparing endpoint message SOMC publish'
           ,'AfterEndpointMsgSOMCPublish' : 'endpoint message SOMC publish'
           ,'PreEndpointMsgSOMCGet' : 'preparing endpoint message SOMC get'
           ,'AfterEndpointMsgSOMCGet' : 'endpoint message SOMC get'
           ,'PreOfferingMsgBCPublish' : 'preparing endpoint message blockchain publish'
           ,'AfterOfferingMsgBCPublish' : 'endpoint message blockchain publish'
           ,'PreOfferingMsgSOMCPublish' : 'preparing offering message SOMC publish'
           ,'PreOfferingPopUp' : 'preparing offering pop up'
           ,'AfterOfferingPopUp' : 'offering pop up'
           ,'PreOfferingDelete' : 'preparing offering delete'
           ,'AfterOfferingDelete' : 'offering delete'
           ,'preAccountAddBalanceApprove' : 'preparing account add balance approve'
           ,'preAccountAddBalance' : 'preparing account add balance'
           ,'aterAccountAddBalance' : 'account add balance'
           ,'preAccountReturnBalance' : 'preparing account return balance'
           ,'afterAccountReturnBalance' : 'account return balance'
           ,'AccountUpdateBalances' : 'account update balances'
        };
    }

    render() {
        const jobtype = this.props.jobtype.replace(/^(client|agent)/, '');

        return <span>
                {jobtype in this.aliases ? this.aliases[jobtype] : 'unknown job type'}
            </span>;

    }
}
