import * as React from 'react';
import ConfirmPopupSwal from '../../components/confirmPopupSwal';

export default class TerminateContractButton extends React.Component<any, any>{

    render(){
        return <div className='card m-b-20 card-body text-xs-center warningAreaCard'>
            <form>
                <h5 className='card-title'>Warning Area</h5>
                <p className='card-text'>This operation will terminate the service and call the "Uncooperative close" procedure</p>
                <ConfirmPopupSwal
                    endpoint={`/client/channels/${this.props.channelId}/status`}
                    options={{method: 'put', body: {action: 'terminate'}}}
                    title={'Terminate contract'}
                    text={<span>This operation will terminate the service and call the "Uncooperative close" procedure</span>}
                    class={'btn btn-danger btn-custom btn-block'}
                    swalType='danger'
                    swalConfirmBtnText='Yes, terminate contract!'
                    swalTitle='Are you sure?'
                    redirectTo='/client-history'
                    done={this.props.done}/>
            </form>
        </div>;
    }
}
