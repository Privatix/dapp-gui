import * as React from 'react';
import { withTranslation } from 'react-i18next';

const translated = withTranslation(['client/vpnList']);

class SelectByAgent extends React.Component<any,any> {

    render() {

        const { t, agentHash, onChange } = this.props;

        return (
            <div className='form-group row'>
                <div className='col-12'>
                    <label className='control-label'>{t('AgentAddress')}</label>
                </div>
                <div className='col-md-12'>
                    <div className='input-group searchInputGroup searchInputGroupVPNList'>
                        <div className='input-group-prepend'>
                            <span className='input-group-text'><i className='fa fa-search'></i></span>
                        </div>
                        <input className='form-control'
                               type='search'
                               name='agent'
                               placeholder='0x354B10B5c4A96b81b5e4F12F90cd0b7Ae5e05eE6'
                               value={agentHash}
                               onChange={onChange} />
                    </div>
                </div>
            </div>
        );
    }
}

export default translated(SelectByAgent);
