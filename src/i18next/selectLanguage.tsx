import * as React from 'react';
import Select from 'react-select';
import { translate } from 'react-i18next';
import { langs, defLang } from './init';
import * as api from '../utils/api';

@translate()
class SelectLanguage extends React.Component<any, any> {

    constructor(props: any){
        super(props);
        this.state = {lang: defLang};
        api.settings.getLocal()
            .then(settings => {
                this.changeLanguage(langs.find(lang => lang.value === settings.lang));
            });
    }

    changeLanguage(lng:any){
        this.props.i18n.changeLanguage(lng.value, () => {
            this.setState({lang: lng.value});
            api.settings.updateLocal({lang: lng.value});
        });
    }

    render() {

        return <Select className='form-control'
            value={this.state.lang}
            searchable={false}
            clearable={false}
            options={langs}
            onChange={this.changeLanguage.bind(this)} />;
  }
}

export default SelectLanguage;
