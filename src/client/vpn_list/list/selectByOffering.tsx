import * as React from 'react';
import { withTranslation } from 'react-i18next';

const translated = withTranslation(['client/vpnList']);

class SelectByOffering extends React.Component<any,any> {

    render() {

        const { t, offeringHash, onChange } = this.props;

        return (
            <div className='form-group row'>
                <div className='col-12'>
                    <label className='control-label'>{t('OfferingHash')}</label>
                </div>
                <div className='col-md-12'>
                    <div className='input-group searchInputGroup searchInputGroupVPNList'>
                        <div className='input-group-prepend'>
                            <span className='input-group-text'><i className='fa fa-search'></i></span>
                        </div>
                        <input className='form-control'
                               type='search'
                               name='offeringHash'
                               placeholder='0x74c96979ae4fbb11a7122a71e90161f1feee7523472cea74f8b9f3ca8481fb37'
                               value={offeringHash}
                               onChange={onChange} />
                    </div>
                </div>
            </div>
        );
    }
}

export default translated(SelectByOffering);
