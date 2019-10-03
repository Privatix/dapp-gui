import React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

interface IProps extends WithTranslation {
    onSubmit: (event: any) => void;
}

export const NextButton = withTranslation('auth/utils')((({onSubmit, t}) => <button
    className='btn btn-default text-uppercase waves-effect waves-light pull-right m-l-5'
    type='button'
    onClick={onSubmit}
  >
  {t('Next')}
  </button>) as React.SFC<IProps>);

export const FinishButton = withTranslation('auth/utils')((({onSubmit, t}) => <button
    className='btn btn-default text-uppercase waves-effect waves-light pull-right m-l-5'
    type='button'
    onClick={onSubmit}
  >
  {t('Finish')}
  </button>) as React.SFC<IProps>);



export const PreviousButton = withTranslation('auth/utils')((({ onSubmit, t }) => <button
    className='btn btn-secondary text-uppercase waves-effect waves-light'
    type='button'
    onClick={onSubmit}
  >
  {t('Previous')}
  </button>
) as React.SFC<IProps>);

export const back = function(address: string){
    return function (evt: any){
        evt.preventDefault();
        this.props.history.push(address);
    };
};
