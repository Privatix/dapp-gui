import * as React from 'react';
import * as ReactDOM from 'react-dom';

import ReactSweetAlert from 'react-sweetalert-vilan';
import {fetch} from 'Utils/fetch';

export default function(props:any) {

    function showPopUpSwal(event: any) {
        event.preventDefault();
        ReactDOM.render(
            <ReactSweetAlert
                show={true}
                type={props.swalType}
                showCancel
                closeOnClickOutside={false}
                confirmBtnText={props.swalConfirmBtnText}
                confirmBtnCssClass='swal2-styled'
                cancelBtnCssClass='swal2-styled'
                title={props.swalTitle}
                onConfirm={confirmHandler}
                onCancel={cancelHandler}
            >{props.text}</ReactSweetAlert>, document.getElementById('swalModal')
        );
    }

    function confirmHandler() {
        const options = props.options;
        fetch(props.endpoint, options);
        ReactDOM.unmountComponentAtNode(document.getElementById('swalModal'));
    }

    function cancelHandler(event: any) {
        event.preventDefault();
        ReactDOM.unmountComponentAtNode(document.getElementById('swalModal'));
    }

    return (
        <div>
            <p><button onClick={showPopUpSwal} className={props.class}>{props.title}</button></p>
            <div id='swalModal'></div>
        </div>
    );
}
