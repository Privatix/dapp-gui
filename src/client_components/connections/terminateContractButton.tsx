import * as React from 'react';
import ConfirmPopupSwal from '../../components/confirmPopupSwal';

export default class TerminateContractButton extends React.Component<any, any>{

    render(){
        return <div className='card m-b-20 card-body text-xs-center warningAreaCard'>
            <form>
                <h5 className='card-title'>Warning Area</h5>
                <p className='card-text'>Permanently stop using service and request full deposit return.</p>
                <p className='card-text'>Use only, if Agent doesn’t closes contract for very long time.<br />
                    You pay multiple transaction fees.</p>
                <ConfirmPopupSwal
                    endpoint={`/client/channels/${this.props.channelId}/status`}
                    options={{method: 'put', body: {action: 'terminate'}}}
                    title={'Terminate contract'}
                    text={<span>Permanently stop using service and request full deposit return.<br />
                        Use only, if Agent doesn’t closes contract for very long time.<br />
                        You pay multiple transaction fees.
                    </span>}
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
