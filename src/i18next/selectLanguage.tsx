import * as React from 'react';
import { connect } from 'react-redux';
import { WithTranslation, withTranslation } from 'react-i18next';

import Select from 'react-select';

import { WS } from 'utils/ws';
import initElectronMenu from 'utils/electronMenu';

import { langs } from './init';

import { State } from 'typings/state';

interface IProps extends WithTranslation {
    lang?: string;
    ws?: WS;
    dispatch?: any;
}

interface IState {
    lang: string;
}

const translate = withTranslation();

class SelectLanguage extends React.Component<IProps, IState> {

    constructor(props: IProps){
        super(props);
        this.state = {lang: props.lang};
    }

    changeLanguage = (lang:any) => {

        const { i18n, ws } = this.props;

        i18n.changeLanguage(lang.value, () => {
            ws.setGUISettings({lang: lang.value});
            // From custom electron menu
            initElectronMenu(this.props.dispatch);
        });
        this.setState({lang: lang.value});
    }

    render() {

        const { lang } = this.state;

        return <Select className='form-control'
            value={lang}
            searchable={false}
            clearable={false}
            options={langs}
            onChange={this.changeLanguage} />;
    }
}

export default connect( (state: State) => ({ws: state.ws, lang: state.localSettings.lang}))(translate(SelectLanguage));
