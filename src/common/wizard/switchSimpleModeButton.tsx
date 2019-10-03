import React from 'react';
import { connect } from 'react-redux';
import { WithTranslation, withTranslation } from 'react-i18next';

import { asyncProviders } from 'redux/actions';

import { Dispatch } from 'redux';

import { Mode } from 'typings/mode';

interface IProps extends WithTranslation {
    setSimpleMode?(): void;
}

const translate = withTranslation(['client/simpleMode']);

class SwitchSimpleModeButton extends React.Component<IProps, {}> {

    onClick = (evt) => {
        evt.preventDefault();
        const { setSimpleMode } = this.props;
        setSimpleMode();
    }

    render(){

        const { t } = this.props;

        return <a href='' style={ {margin: '10px'} } onClick={this.onClick}>{t('SimpleMode')}</a>;
    }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch: Dispatch<any>) => ({ 
    setSimpleMode: () => {
        dispatch(asyncProviders.setMode(Mode.WIZARD));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(translate(SwitchSimpleModeButton));
