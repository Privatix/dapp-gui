import * as React from 'react';
import { Link } from 'react-router-dom';
import { translate } from 'react-i18next';

const translated = translate('auth/steps');

interface IProps {
    t?: any;
    step: number;
    prix: boolean;
    shape: 'simple' | 'advanced';
}

class Steps extends React.Component<IProps, {}>{

    constructor(props: IProps){
        super(props);
    }

    render(){

        const {step, t, prix, shape} = this.props;

        if(shape === 'advanced'){
            return (
                <div className='steps clearfix'>
                    <ul role='tablist'>
                        <li role='tab' className={ step > 1 ? 'first done' : 'first current' } style={{width:'auto'}}>
                            <Link id='steps-uid-0-t-0' to='#'>
                                <span className='current-info audible'>{t('currentStep')}: </span>
                                <span className='number'>1.</span>
                                {t('Language')}
                            </Link>
                        </li>
                        <li role='tab' className={ step >= 2 ? (step > 2 ? 'first done' : 'first current') : 'disabled' } style={{width:'auto'}}>
                            <Link id='steps-uid-0-t-0' to='#'>
                                <span className='current-info audible'>{t('currentStep')}: </span>
                                <span className='number'>2.</span>
                                {t('Password')}
                            </Link>
                        </li>
                        <li role='tab' className={ step >= 3 ? (step > 3 ? 'done' : 'current') : 'disabled'} style={{width:'auto'}}>
                            <Link id='steps-uid-0-t-1' to='#'>
                                <span className='number'>3.</span>
                                {t('Import')}
                            </Link>
                        </li>
                        <li role='tab' className={ step >= 4 ? (step > 4 ? 'done' : 'current') : 'disabled'} style={{width:'auto'}}>
                            <a id='steps-uid-0-t-2' href='#'>
                                <span className='number'>4.</span>
                                {t('Account')}
                            </a>
                        </li>
                        <li role='tab' className={ step >= 5 ? (step > 5 ? 'done' : 'current') : 'disabled'} style={{width:'auto'}}>
                            <a id='steps-uid-0-t-3' href='#'>
                                <span className='number'>5.</span>
                                {t('Backup')}
                            </a>
                        </li>
                        {/* this step is only relevant for test net */ }
                        {prix ?
                            <li role='tab' className={ step >= 6 ? (step > 6 ? 'done' : 'current') : 'disabled'} style={{width:'auto'}}>
                                <a id='steps-uid-0-t-4' href='#'>
                                    <span className='number'>6.</span>
                                    {'PRIX'}
                                </a>
                            </li>
                           : null
                        }
                    </ul>
                </div>
            );
        }

        if(shape === 'simple'){
            return (
                <div className='steps clearfix'>
                    <ul role='tablist'>
                        <li role='tab' className={ step > 1 ? 'first done' : 'first current' } style={{width:'auto'}}>
                            <Link id='steps-uid-0-t-0' to='#'>
                                <span className='current-info audible'>{t('currentStep')}: </span>
                                <span className='number'>1.</span>
                                {t('Language')}
                            </Link>
                        </li>
                        <li role='tab' className={ step >= 2 ? (step > 2 ? 'first done' : 'first current') : 'disabled' } style={{width:'auto'}}>
                            <Link id='steps-uid-0-t-0' to='#'>
                                <span className='current-info audible'>{t('currentStep')}: </span>
                                <span className='number'>2.</span>
                                {t('Password')}
                            </Link>
                        </li>
                        {/* this step is only relevant for test net */ }
                        <li role='tab' className={ step >= 3 ? (step > 3 ? 'done' : 'current') : 'disabled'} style={{width:'auto'}}>
                            <a id='steps-uid-0-t-4' href='#'>
                                <span className='number'>3.</span>
                                {'PRIX'}
                            </a>
                        </li>
                    </ul>
                </div>
            );
        }

        return null;
    }
}

export default translated(Steps);
