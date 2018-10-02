import * as React from 'react';

import ReactSweetAlert from 'react-sweetalert-vilan';
import {fetch} from '../utils/fetch';
import { translate } from 'react-i18next';

@translate('confirmPopupSwal')

export default class ConfirmPopupSwal extends React.Component<any, any>{

    constructor(props: any) {
        super(props);
        this.state = {show: false};
    }

    async showPopUpSwal(event: any) {
        event.preventDefault();
        if('function' === typeof this.props.beforeAsking){
            this.setState({show: await this.props.beforeAsking()});
        }else{
            this.setState({show: true});
        }
    }

    confirmHandler() {

        const cancel = (res?:any) => {
            if('done' in this.props && typeof this.props.done === 'function'){
                this.props.done(res);
            }
            this.cancelHandler();
        };

        if('function' === typeof this.props.confirmHandler){
            this.props.confirmHandler();
            cancel();
        }else{
            const options = this.props.options;
            fetch(this.props.endpoint, options).then(cancel);
        }
    }

    cancelHandler(event?: any) {
        if(event && event.preventDefault){
            event.preventDefault();
        }
        this.setState({show: false});
    }

    render(){
        const { t } = this.props;

        return (
            <div>
                <button onClick={this.showPopUpSwal.bind(this)} className={this.props.class}>{this.props.title}</button>
                <ReactSweetAlert
                    show={this.state.show}
                    type={this.props.swalType}
                    showCancel
                    closeOnClickOutside={false}
                    confirmBtnText={this.props.swalConfirmBtnText}
                    cancelBtnText={t('CancelBtn')}
                    confirmBtnCssClass='swal2-styled'
                    cancelBtnCssClass='swal2-styled'
                    title={this.props.swalTitle}
                    onConfirm={this.confirmHandler.bind(this)}
                    onCancel={this.cancelHandler.bind(this)}
                >{this.props.text}</ReactSweetAlert>
            </div>
        );
    }
}
