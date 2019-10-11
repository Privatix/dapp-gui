import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import { WS, ws } from 'utils/ws';

interface IProps extends WithTranslation {
    ws?: WS;
    version: string;
}

const translate = withTranslation('updateInformer');

class DoNotShowUpdateNotification extends React.Component<IProps, {}>{

    onSkip = (evt: any) => {
        const { ws, version } = this.props;
        evt.preventDefault();
        ws.updateSettings({updateDismissVersion: version});
    }

    render(){

        const { t } = this.props;

        return (
            <div style={ {padding: '15px'} } >
                <button type='button'
                        onClick={this.onSkip}
                        className='btn btn-default btn-custom btn-lg w-lg waves-effect waves-light' >
                    {t('DoNotShow')}
                </button>
            </div>
        );
    }

}

export default ws<IProps>(translate(DoNotShowUpdateNotification));
