import * as React from 'react';
import { connect } from 'react-redux';

import handlers from 'redux/actions';

import ReactSweetAlert from 'react-sweetalert-vilan';
import { WithTranslation, withTranslation } from 'react-i18next';

import {State} from 'typings/state';
import {remote} from 'electron';

interface IProps extends WithTranslation {
    showExternalLink: boolean;
    externalLink: string;
    dispatch: any;
}

const translate = withTranslation(['externalLinks/warning']);

class ExternalLinkWarning extends React.Component<IProps, {}>{

    cancelHandler = () => {
        const { dispatch } = this.props;
        dispatch(handlers.showExternalLinkWarning(false, ''));
    }

    confirmHandler = async () => {
        const { dispatch } = this.props;
        dispatch(handlers.showExternalLinkWarning(false, ''));
        remote.shell.openExternal(this.props.externalLink);
    }

    render(){

        const { showExternalLink, t } = this.props;
        const ReactSweetAlertComponent = <ReactSweetAlert
            show={showExternalLink}
            type={'warning'}
            showCancel
            closeOnClickOutside={true}
            confirmBtnText={t('confirmBtn')}
            confirmBtnCssClass='swal2-styled'
            confirmBtnBsStyle='link'
            cancelBtnBsStyle='primary'
            cancelBtnCssClass='swal2-styled'
            title={t('AreYouSure')}
            onCancel={this.cancelHandler}
            onConfirm={this.confirmHandler}
        >
            {t('warning')}
        </ReactSweetAlert>;

        return ReactSweetAlertComponent;
    }
}

export default connect( (state: State) => ({showExternalLink: state.showExternalLink, externalLink: state.externalLink}) )(translate(ExternalLinkWarning));
