import * as React from 'react';
import Modal from 'react-awesome-modal';

export default class ModalWindow extends React.Component<any, any> {

    constructor(props: any) {

        super(props);
        this.state = {visible: props.visible};
    }

    static getDerivedStateFromProps(props: any, state: any){
        return {visible: props.visible};
    }

    closeModal(event: any) {
        event.preventDefault();
        document.body.classList.remove('modal-open');
        this.setState({visible: false});
    }

    showModal(event: any) {
        event.preventDefault();
        document.body.classList.add('modal-open');
        this.setState({visible: true});
    }

    render(){
        return (
            <div>
                <a href='#' onClick={this.showModal.bind(this)} className={this.props.customClass}>{this.props.text}</a>
                <div className='modalWrap'>
                    <Modal
                        visible={this.state.visible}
                        width='90%'
                        effect='fadeInUp'
                        onClickAway={this.closeModal.bind(this)}
                    >
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <h4 className='modal-title'>{this.props.modalTitle}</h4>
                                <button type='button' className='close' onClick={this.closeModal.bind(this)}>×</button>
                            </div>
                            <div className='modal-body'>
                                {this.props.component}
                            </div>
                        </div>
                    </Modal>
                </div>
            </div>
        );
    }
}
