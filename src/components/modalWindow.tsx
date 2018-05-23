import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Modal from 'react-awesome-modal';

export default function(props:any) {

    function closeModal(event: any) {
        event.preventDefault();
        ReactDOM.unmountComponentAtNode(document.getElementById('modalWrap'));
    }

    function showModal(event: any) {
        event.preventDefault();

        ReactDOM.render(
            <Modal
                visible={true}
                width='90%'
                effect='fadeInUp'
                onClickAway={closeModal}
            >
                <div className='modal-content'>
                    <div className='modal-header'>
                        <h4 className='modal-title'>Account</h4>
                        <button type='button' className='close' onClick={closeModal}>×</button>
                    </div>
                    <div className='modal-body'>
                        {/*<Account account={account}/>*/}
                        {props.component}
                    </div>
                </div>
            </Modal>, document.getElementById('modalWrap')
        );
    }

    return (
        <div>
            <a href='#' onClick={showModal} data-data={props.data} className={props.class}>{props.text}</a>
            <div id='modalWrap'></div>
        </div>
    );
}
