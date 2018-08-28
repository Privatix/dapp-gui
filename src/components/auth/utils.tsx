import * as React from 'react';
import { withRouter } from 'react-router';
import * as keythereum from 'keythereum';
import { translate } from 'react-i18next';

export const NextButton = translate('auth/utils')(({onSubmit, t}) => <button
    className='btn btn-default text-uppercase waves-effect waves-light pull-right m-l-5'
    type='button'
    onClick={onSubmit}
  >
  {t('Next')}
  </button>);

export const PreviousButton = translate('auth/utils')(withRouter(({ history, t }) => <button
    className='btn btn-secondary text-uppercase waves-effect waves-light'
    type='button'
    onClick={async (evt: any) => {
        evt.preventDefault();
        history.push('/setAccount');
      }
    }
  >
  {t('Previous')}
  </button>
));

export const createPrivateKey = function(){
    const params = { keyBytes: 32, ivBytes: 16 };
    const dk = keythereum.create(params);
    return dk;
};
