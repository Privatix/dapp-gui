import * as React from 'react';
import { translate } from 'react-i18next';

interface IProps {
    t?: any;
    href: string;
}

@translate('updateInformer')
class GoToUpdateButton extends React.Component<IProps, {}>{

    onClick = (evt: any) => {

        const { href } = this.props;
        const shell = require('electron').shell;

        evt.preventDefault();
        shell.openExternal(href);
    }

    render(){

        const { t } = this.props;

        return (
            <div style={ {padding: '15px'} } >
                <button type='button'
                        onClick={this.onClick}
                        className='btn btn-default btn-custom btn-lg w-lg waves-effect waves-light' >
                    {t('GoToUpdate')}
                </button>
            </div>
        );
    }

}

export default GoToUpdateButton;
