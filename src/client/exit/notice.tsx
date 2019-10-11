import * as React from 'react';
import { connect } from 'react-redux';

import handlers from 'redux/actions';

import stopSupervisor from 'utils/stopSupervisor';
import ReactSweetAlert from 'react-sweetalert-vilan';
import { WithTranslation, withTranslation } from 'react-i18next';
import * as api from 'utils/api';

import {State} from 'typings/state';

interface IProps extends WithTranslation {
    exit: boolean;
    dispatch: any;
    ws: State['ws'];
}

const translate = withTranslation(['exit']);

class ExitNotice extends React.Component<IProps, {}>{

    cancelHandler = () => {
        const { dispatch } = this.props;
        dispatch(handlers.setExit(false));
    }

    confirmHandler = async () => {
        const { ws } = this.props;
        const channels = await ws.getClientChannels([], ['active', 'activating', 'pending'], 0, 0);
        const requests = channels.items.map(channel => ws.changeChannelStatus(channel.id, 'terminate'));
        await Promise.all(requests);
        await stopSupervisor();
        api.exit();
    }

    render(){

        const { exit, t } = this.props;
        const ReactSweetAlertComponent = <ReactSweetAlert
            show={exit}
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

export default connect( (state: State) => ({ws: state.ws, exit: state.exit}) )(translate(ExitNotice));
