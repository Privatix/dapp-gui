import * as React from 'react';

import ReactSweetAlert from 'react-sweetalert-vilan';
import { translate } from 'react-i18next';

interface IProps {
    t?: any;
    beforeAsking?: Function;
    done?: Function;
    class: string;
    title: string;
    swalType: string;
    swalTitle: string|JSX.Element;
    swalConfirmBtnText: string;
    text: string|JSX.Element;
}

@translate('confirmPopupSwal')

export default class ConfirmPopupSwal extends React.Component<IProps, any>{

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

        if('done' in this.props && 'function' === typeof this.props.done){
            this.props.done();
        }
        this.cancelHandler();
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
