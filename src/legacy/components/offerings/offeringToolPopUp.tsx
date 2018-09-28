import * as React from 'react';
import { translate } from 'react-i18next';
import Button from '../../../components/button';

export default translate('offerings/offeringTools')(({t}) => {
    return <Button endpoint={`/offerings/${props.offeringId}/status`}
                   options={{method: 'put', body: {action: 'popup'}}}
                   title={t('Popup')}
                   class='btn btn-primary btn-custom btn-block'
           />;
});
