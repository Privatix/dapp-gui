import * as React from 'react';

import ReactSweetAlert from 'react-sweetalert-vilan';
import { translate } from 'react-i18next';

interface IProps {
    t?: any;
    beforeAsking?: Function;
    done?: Function;
    className: string;
    title: string;
    swalType: string;
    swalTitle: string|JSX.Element;
    swalConfirmBtnText: string;
    text: string|JSX.Element;
    disabledBtn?: boolean;
    parentDivClassName?: string;
}

interface IState {
    show: boolean;
}

@translate('confirmPopupSwal')

export default class ConfirmPopupSwal extends React.Component<IProps, IState>{

    showConfirmAlertBtn = null;

    constructor(props: IProps) {
        super(props);
        this.showConfirmAlertBtn = React.createRef();
        this.state = {show: false};
    }

    showPopUpSwal = async (event: any) => {

        const { disabledBtn, beforeAsking } = this.props;

        event.preventDefault();
        if (disabledBtn) {
            this.showConfirmAlertBtn.current.setAttribute('disabled', 'disabled');
            return;
        }
        if('function' === typeof beforeAsking){
            this.setState({show: await beforeAsking()});
        }else{
            this.setState({show: true});
        }
    }

    confirmHandler = async () => {

        const { disabledBtn, done } = this.props;

        if (disabledBtn) {
            this.cancelHandler(null, true);
        } else {
            this.cancelHandler();
        }
        if('function' === typeof done) {
            await done();
        }
        if (disabledBtn && this.showConfirmAlertBtn.current) {
            this.showConfirmAlertBtn.current.removeAttribute('disabled');
        }
    }

    cancelHandler = (event?: any, keepDisabled?: boolean) => {
        if(event && event.preventDefault){
            event.preventDefault();
        }

        if (this.props.disabledBtn && !keepDisabled) {
            this.showConfirmAlertBtn.current.removeAttribute('disabled');
        }
        this.setState({show: false});
    }

    render(){

        const { t, parentDivClassName, className, title, text, swalTitle, swalConfirmBtnText, swalType } = this.props;
        const { show } = this.state;

        return (
            <div className={parentDivClassName}>
                <button onClick={this.showPopUpSwal}
                        className={className}
                        ref={this.showConfirmAlertBtn}
                >
                    {title}
                </button>
                <ReactSweetAlert
                    show={show}
                    type={swalType}
                    showCancel
                    closeOnClickOutside={false}
                    confirmBtnText={swalConfirmBtnText}
                    cancelBtnText={t('CancelBtn')}
                    confirmBtnCssClass='swal2-styled'
                    confirmBtnBsStyle='link'
                    cancelBtnBsStyle='primary'
                    cancelBtnCssClass='swal2-styled'
                    title={swalTitle}
                    onConfirm={this.confirmHandler}
                    onCancel={this.cancelHandler}
                >
                    {text}
               </ReactSweetAlert>
            </div>
        );
    }
}
