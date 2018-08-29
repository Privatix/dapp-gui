import * as React from 'react';
import Steps from './steps';
import { withRouter } from 'react-router-dom';
import {NextButton} from './utils';
import { translate } from 'react-i18next';
import SelectLanguage from '../../i18next/selectLanguage';

@translate(['auth/setLanguage'])
class SetLanguage extends React.Component<any, any>{

    onSubmit = (evt: any) => {
        evt.preventDefault();
        this.props.history.push('/setPassword');
    }

    render(){

        const { t } = this.props;

        return <div className='card-box'>
            <div className='panel-heading'>
                <h4 className='text-center'> {t('chooseTheLanguage')} </h4>
            </div>

            <div className='p-20 wizard clearfix'>
                <Steps step='1' />
                <div className='content clearfix text-center'>
                    <div className='col-3' style={{margin: 'auto', position: 'absolute', left: 0, right: 0, top: 0, bottom: 0}} >
                        <span className='col-3 col-form-label'>{t('PleaseSelectLanguage')}</span><br /><br />
                        <SelectLanguage />
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

export default withRouter(SetLanguage);
