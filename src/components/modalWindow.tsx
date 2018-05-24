import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Modal from 'react-awesome-modal';

export default function(props:any) {

    function closeModal(event: any) {
        event.preventDefault();
        document.body.classList.remove('modal-open');
        ReactDOM.unmountComponentAtNode(document.querySelector('.modalWrap'));
    }

    function showModal(event: any) {
        event.preventDefault();
        document.body.classList.add('modal-open');

        ReactDOM.render(
            <Modal
                visible={true}
                width='90%'
                effect='fadeInUp'
                onClickAway={closeModal}
            >
                <div className='modal-content'>
                    <div className='modal-header'>
                        <h4 className='modal-title'>{props.modalTitle}</h4>
                        <button type='button' className='close' onClick={closeModal}>×</button>
                    </div>
                    <div className='modal-body'>
                        {props.component}
                    </div>
                </div>
            </Modal>, document.querySelector('.modalWrap')
        );
    }

    return (
        <div>
            <a href='#' onClick={showModal} className={props.customClass}>{props.text}</a>
            <div className='modalWrap'></div>
        </div>
    );
}
