import * as React from 'react';
import ConfirmPopupSwal from '../../components/confirmPopupSwal';

export default class TerminateContractButton extends React.Component<any, any>{

    render(){
        return this.props.status === 'disabled'
            ? <div className='card m-b-20 card-body text-xs-center warningAreaCard'>
                <span>To open dispute, finish using the service</span><br />
                <button className='btn btn-danger btn-custom btn-block disabled' >Terminate contract</button>
              </div>
            : <div className='card m-b-20 card-body text-xs-center warningAreaCard'>
                <form>
                    <h5 className='card-title'>Warning Area</h5>
                    <p className='card-text'>Request full deposit return.</p>
                    <p className='card-text'>Use only, if Agent doesn’t closes contract for very long time.<br />
                        You pay multiple transaction fees.</p>
                    <ConfirmPopupSwal
                        endpoint={`/client/channels/${this.props.channelId}/status`}
                        options={{method: 'put', body: {action: 'close'}}}
                        title={'Terminate contract'}
                        text={<span>Request full deposit return.<br />
                            Use only, if Agent doesn’t closes contract for very long time.<br />
                            You pay multiple transaction fees.
                        </span>}
                        class={'btn btn-danger btn-custom btn-block'}
                        swalType='danger'
                        swalConfirmBtnText='Yes, terminate contract!'
                        swalTitle='Are you sure?'
                        done={this.props.done} />
                </form>
            </div>;
    }
}
