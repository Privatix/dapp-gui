import * as React from 'react';
import { connect } from 'react-redux';

import handlers from 'redux/actions';

import ReactSweetAlert from 'react-sweetalert-vilan';
import { translate } from 'react-i18next';

import {State} from 'typings/state';
import {remote} from 'electron';

interface IProps {
    t?: any;
    showExternalLink: boolean;
    dispatch: any;
}

@translate(['exit'])
class ExternalLinkWarning extends React.Component<IProps, {}>{

    cancelHandler = () => {
        const { dispatch } = this.props;
        dispatch(handlers.showExternalLinkWarning(false, ''));
    }

    confirmHandler = async () => {
        const { dispatch } = this.props;
        dispatch(handlers.showExternalLinkWarning(false, ''));
        // TODO: Open external Link
        remote.shell.openExternal('https://privatix.io');
    }

    render(){

        const { showExternalLink, t } = this.props;
        const ReactSweetAlertComponent = <ReactSweetAlert
            show={showExternalLink}
            type={'warning'}
            showCancel
            closeOnClickOutside={true}
            confirmBtnText={t('terminate')}
            cancelBtnText={t('cancel')}
            confirmBtnCssClass='swal2-styled'
            confirmBtnBsStyle='link'
            cancelBtnBsStyle='primary'
            cancelBtnCssClass='swal2-styled'
            title={t('title')}
            onCancel={this.cancelHandler}
            onConfirm={this.confirmHandler}
        >
            <div>{t('exitMessage')}</div>
        </ReactSweetAlert>;

        return ReactSweetAlertComponent;
    }
}

export default connect( (state: State) => ({showExternalLink: state.showExternalLink, externalLink: state.externalLink}) )(ExternalLinkWarning);
