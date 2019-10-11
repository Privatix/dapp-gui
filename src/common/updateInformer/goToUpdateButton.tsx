import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

interface IProps extends WithTranslation {
    href: string;
}

const translate = withTranslation('updateInformer');

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

export default translate(GoToUpdateButton);
