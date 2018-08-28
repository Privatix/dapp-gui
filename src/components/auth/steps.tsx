import * as React from 'react';
import { Link } from 'react-router-dom';
import { translate } from 'react-i18next';

export default translate('auth/steps')(({step, t}) => (

	<div className='steps clearfix'>
        <ul role='tablist'>
            <li role='tab' className={ step > 1 ? 'first done' : 'first current' } style={{width:'auto'}}>
                <Link id='steps-uid-0-t-0' to='#'>
                    <span className='current-info audible'>{t('currentStep')}: </span>
                    <span className='number'>1.</span>
                    {t('Password')}
                </Link>
            </li>
            <li role='tab' className={ step >= 2 ? (step > 2 ? 'done' : 'current') : 'disabled'} style={{width:'auto'}}>
                <Link id='steps-uid-0-t-1' to='#'>
                    <span className='number'>2.</span>
                    {t('Import')}
                </Link>
            </li>
            <li role='tab' className={ step >= 3 ? (step > 3 ? 'done' : 'current') : 'disabled'} style={{width:'auto'}}>
                <a id='steps-uid-0-t-2' href='#'>
                    <span className='number'>3.</span>
                    {t('Account')}
                </a>
            </li>
            <li role='tab' className={ step === '4' ? 'current' : 'disabled' } style={{width:'auto'}}>
                <a id='steps-uid-0-t-3' href='#'>
                    <span className='number'>4.</span>
                    {t('Backup')}
                </a>
            </li>
        </ul>
    </div>
));
