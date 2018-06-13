import * as React from 'react';
import { withRouter } from 'react-router';
import * as keythereum from 'keythereum';

export const PreviousButton = withRouter(({ history }) => <button
    className='btn btn-secondary text-uppercase waves-effect waves-light'
    type='button'
    onClick={async (evt: any) => {
        evt.preventDefault();
        history.push('/setAccount');
      }
    }
  >
    Previous
  </button>
);

export const createPrivateKey = function(){
    const params = { keyBytes: 32, ivBytes: 16 };
    const dk = keythereum.create(params);
    return dk;
};
