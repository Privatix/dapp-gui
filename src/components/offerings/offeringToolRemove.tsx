import * as React from 'react';
import { translate } from 'react-i18next';
import Button from '../button';

export default translate('offerings/offeringTools')(({t}) => {
    return <Button endpoint={`/offerings/${props.offeringId}/status`}
                   options={{method: 'put', body: {action: 'remove'}}}
                   title={t('Remove')}
                   class='btn btn-danger btn-custom btn-block'
           />;
});
