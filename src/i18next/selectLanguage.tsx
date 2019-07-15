import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import initElectronMenu from 'common/electronMenu';
import Select from 'react-select';

import { State } from 'typings/state';
import { WS } from 'utils/ws';

import { langs } from './init';

interface IProps {
    ws?: WS;
    lang?: string;
    i18n?: any;
    dispatch?: any;
}

interface IState {
    lang: string;
}

@translate()
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

export default connect( (state: State) => ({ws: state.ws, lang: state.localSettings.lang}))(SelectLanguage);
