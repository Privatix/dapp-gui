import * as React from 'react';
import { translate } from 'react-i18next';

import { WS, ws } from 'utils/ws';

interface IProps {
    t?: any;
    ws?: WS;
    version: string;
}

@translate('updateInformer')
class DoNotShowUpdateNotification extends React.Component<IProps, any>{

    onSkip = (evt: any) => {
        const { ws, version } = this.props;
        evt.preventDefault();
        console.log(this.props.version);
        ws.updateSettings({updateDismissVersion: version});
    }

    render(){

        const { t } = this.props;

        return (
            <div style={ {padding: '15px'} } >
                <button type='button' onClick={this.onSkip} className='btn btn-default btn-custom btn-lg w-lg waves-effect waves-light' >{t('DoNotShow')}</button>
            </div>
        );
    }

}

export default ws<IProps>(DoNotShowUpdateNotification);
