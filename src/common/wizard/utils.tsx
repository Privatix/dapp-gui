import * as React from 'react';
import { translate } from 'react-i18next';

export const NextButton = translate('auth/utils')(({onSubmit, t}) => <button
    className='btn btn-default text-uppercase waves-effect waves-light pull-right m-l-5'
    type='button'
    onClick={onSubmit}
  >
  {t('Next')}
  </button>);

export const FinishButton = translate('auth/utils')(({onSubmit, t}) => <button
    className='btn btn-default text-uppercase waves-effect waves-light pull-right m-l-5'
    type='button'
    onClick={onSubmit}
  >
  {t('Finish')}
  </button>);



export const PreviousButton = translate('auth/utils')(({ onSubmit, t }) => <button
    className='btn btn-secondary text-uppercase waves-effect waves-light'
    type='button'
    onClick={onSubmit}
  >
  {t('Previous')}
  </button>
);

export const back = function(address: string){
    return function (evt: any){
        evt.preventDefault();
        this.props.history.push(address);
    };
};
