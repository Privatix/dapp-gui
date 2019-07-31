import * as React from 'react';
import { translate } from 'react-i18next';

interface IProps {
    t?: any;
    selectedTypes: string[];
    onChange(evt: any): void;
}

const translated = translate(['client/vpnList', 'common']);

class SelectByIPType extends React.Component<IProps, {}>{

    render () {

        const { t, selectedTypes, onChange } = this.props;

        const checkboxes = ['residential', 'datacenter', 'mobile'].map(ipType => (
            <div className='checkbox checkbox-custom' key={ipType}>
                <input id={ipType}
                       type='checkbox'
                       name='checkboxIPType'
                       value={ipType}
                       checked={selectedTypes.includes(ipType)}
                       onChange={onChange} />
                <label htmlFor={ipType}>{t(ipType)}</label>
            </div>)
        );

        return (
            <div className='card m-t-15 m-b-20 vpnListCountryFilterBl'>
                <h5 className='card-header'>{t('common:IPType')}</h5>
                <div className='card-body'>
                    { checkboxes }
                </div>
            </div>
        );
    }
}

export default translated(SelectByIPType);
