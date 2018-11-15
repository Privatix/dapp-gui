import * as React from 'react';
import { translate } from 'react-i18next';

interface IProps {
    t?: any;
    name: string;
    setting: any;
    onChange: (event: any) => void;
}


@translate(['settings', 'utils/notice'])

class SettingsItem extends React.Component<IProps, any> {

    render(){
        const { name: key, setting, onChange, t } = this.props;

        const name = key.split('.').join('_') + '_Name';
        const description = key.split('.').join('_') + '_Description';

        return <tr key={key}>
            <td>{t(name)}:</td>
            <td className='minWidth200'>
                <input className='form-control'
                       disabled={setting.permissions === 'readOnly'}
                       data-id={key}
                       type='text'
                       defaultValue={setting.value}
                       data-desc={t(description)}
                       data-name={t(name)}
                       onChange={onChange}
                />
            </td>
            <td>{t(description)}</td>
        </tr>;
    }
}

export default SettingsItem;
