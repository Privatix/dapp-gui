import React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';

import Steps from './steps';
import {NextButton} from './utils';
import SelectLanguage from 'i18next/selectLanguage';
import SwitchAdvancedModeButton from 'client/lightweightMode/switchAdvancedModeButton';
import SwitchSimpleModeButton from './switchSimpleModeButton';

import { Mode, Role } from 'typings/mode';

interface IProps extends WithTranslation {
    mode: Mode;
    role: Role;
    history?: any;
}

class SetLanguage extends React.Component<IProps, {}>{

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown = (evt: any) => {
        if (evt.keyCode === 13) {
            this.onSubmit();
        }
    }

    onSubmit = () => {
        this.props.history.push('/setPassword');
    }

    render() {

        const { t, mode, role } = this.props;

        return <div className='card-box'>
            { role === Role.CLIENT
                ? <div style={ {textAlign: 'right'} }>
                    { mode === Mode.SIMPLE || mode === Mode.WIZARD
                        ? <SwitchAdvancedModeButton />
                        : <SwitchSimpleModeButton /> }
                </div>
                : null
            }
            <div className='panel-heading'>
                <h4 className='text-center'> {t('chooseTheLanguage')} </h4>
            </div>

            <div className='p-20 wizard clearfix'>
                <Steps step={1} shape={role === Role.AGENT || mode === Mode.ADVANCED ? 'advanced' : 'simple'} />
                <div className='content clearfix text-center'>
                    <div className='col-6 selectLangStep'>
                        <span className='col-4 col-form-label'>{t('PleaseSelectLanguage')}</span>
                        <div className='langSelectBl'>
                            <SelectLanguage />
                        </div>
                    </div>
                    <section className='setPasswordsBl'>
                        <div className='form-group text-right m-t-40'>
                            <div className='col-12'>
                                <NextButton onSubmit={this.onSubmit} />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>;
    }
}

export default withRouter(withTranslation(['auth/setLanguage'])(SetLanguage));
