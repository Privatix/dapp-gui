import * as React from 'react';
import { connect } from 'react-redux';

import handlers from 'redux/actions';

import { State } from 'typings/state';
import notice from 'utils/notice';

interface Props {
    notices?: State['notices'];
    dispatch?: any;
}

class Noticer extends React.Component <Props, {}>{

    componentDidUpdate(prevProps: Props){
        const { dispatch, notices } = this.props;
        if(notices.length){
            dispatch(handlers.removeNotices(notices));
            notices.forEach(noticeItem => {
                notice(noticeItem.notice);
            });
        }
    }

    render(){
        return <></>;
    }
}

export default connect( (state: State) => ({notices: state.notices}) )(Noticer);
