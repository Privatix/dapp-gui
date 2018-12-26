import * as React from 'react';

import ReactSweetAlert from 'react-sweetalert-vilan';
import { translate } from 'react-i18next';

interface IProps {
    t?: any;
    beforeAsking?: Function;
    done?: Function;
    awaitForDone?: boolean;
    class: string;
    title: string;
    swalType: string;
    swalTitle: string|JSX.Element;
    swalConfirmBtnText: string;
    text: string|JSX.Element;
    disabledBtn?: boolean;
}

@translate('confirmPopupSwal')

export default class ConfirmPopupSwal extends React.Component<IProps, any>{

    showConfirmAlertBtn = null;

    constructor(props: any) {
        super(props);
        this.showConfirmAlertBtn = React.createRef();
        this.state = {show: false};
    }

    async showPopUpSwal(event: any) {
        event.preventDefault();
        if (this.props.disabledBtn) {
            this.showConfirmAlertBtn.current.setAttribute('disabled', 'disabled');
        }
        if('function' === typeof this.props.beforeAsking){
            this.setState({show: await this.props.beforeAsking()});
        }else{
            this.setState({show: true});
        }
    }

    async confirmHandler() {
        if (this.props.disabledBtn) {
            this.cancelHandler(null, true);
        } else {
            this.cancelHandler();
        }
        if('done' in this.props && 'function' === typeof this.props.done) {
            if (this.props.awaitForDone) {
                await this.props.done();
            } else {
                this.props.done();
            }
        }
        if (this.props.disabledBtn && this.showConfirmAlertBtn.current) {
            this.showConfirmAlertBtn.current.removeAttribute('disabled');
        }
    }

    cancelHandler(event?: any, keepDisabled?: boolean) {
        if(event && event.preventDefault){
            event.preventDefault();
        }

        if (this.props.disabledBtn && !keepDisabled) {
            this.showConfirmAlertBtn.current.removeAttribute('disabled');
        }
        this.setState({show: false});
    }

    render(){
        const { t } = this.props;

        return (
            <div>
                <button onClick={this.showPopUpSwal.bind(this)} className={this.props.class} ref={this.showConfirmAlertBtn}>
                    {this.props.title}
                </button>
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
