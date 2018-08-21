import * as React from 'react';
import ConfirmPopupSwal from '../../components/confirmPopupSwal';

export default class FinishServiceButton extends React.Component<any, any>{

    render(){
        return <div className='card m-b-20 card-body text-xs-center'>
                <form>
                    <p className='card-text'>Permanently stop using this service.</p>
                    <p className='card-text'>
                        {this.props.channel.usage.cost === 0
                            ? 'You can request full deposit return, after service is terminated.'
                            : 'Remaining deposit will be returned, after Agent closes the contract. Transaction fee is paid by Agent.'
                        }
                    </p>
                    <ConfirmPopupSwal
                        endpoint={`/client/channels/${this.props.channel.id}/status`}
                        options={{method: 'put', body: {action: 'terminate'}}}
                        title={'Finish'}
                        text={
                            <span>Permanently stop using this service.<br />
                                {this.props.channel.usage.cost === 0
                                    ? 'You can request full deposit return, after service is terminated.'
                                    : 'Remaining deposit will be returned, after Agent closes the contract. Transaction fee is paid by Agent.'
                                }
                            </span>}
                        class={'btn btn-primary btn-custom btn-block'}
                        swalType='warning'
                        swalConfirmBtnText='Yes, finish it!'
                        swalTitle='Are you sure?' />
                </form>
            </div>;
    }
}
