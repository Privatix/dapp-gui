import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import Steps from './steps';
import {NextButton} from './utils';

@translate('auth/setAccount')
class SetAccount extends React.Component<any, any> {

    keyType: string;

    constructor(props: any){
        super(props);
        this.keyType = 'generateKey';
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown = (evt: any) => {
        if (evt.keyCode === 13) {
            this.onSubmit(evt);
        }
    }

    handleChange = (e:any) => {
        this.keyType = e.target.value;
    }

    onSubmit(evt: any){
        evt.preventDefault();
        this.props.history.push(`/${this.keyType}/${this.props.default}`);
    }

    render(){

        const { t } = this.props;

        return <div className='card-box'>
            <div className='panel-heading'>
                <h4 className='text-center'> {t('SetTheContractAccount')} <strong className='text-custom'>Privatix</strong> </h4>
            </div>
            <form className='form-horizontal m-t-20'>
                <div className='p-20 wizard clearfix'>
                    <Steps step='3' />
                    <div className='content clearfix'>
                        <section>
                            <p>{t('ForTokenTransfers')}</p>
                            <h5>{t('WeRecommendYou')}:</h5>

                            <ul className='default'>
                                <li>{t('createASeparateAccount')}</li>
                                <li>{t('transferToThem')}</li>
                                <li>{t('useThisSeparateAccount')}</li>
                            </ul>
                            <p>{t('PleaseChooseTheWay')}:</p>
                            <div className='row'>
                                <div className='col-12'>
                                    <div className='custom-control custom-radio'>
                                        <input type='radio'
                                               name='keyType'
                                               id='keyType1'
                                               defaultChecked={this.keyType==='generateKey'}
                                               className='custom-control-input'
                                               value='generateKey'
                                               onChange={this.handleChange}
                                        />
                                        <label className='custom-control-label' htmlFor='keyType1'>{t('GenerateNew')}</label>
                                    </div>
                                    <div className='custom-control custom-radio'>
                                        <input type='radio'
                                               name='keyType'
                                               id='keyType2'
                                               defaultChecked={this.keyType==='importHexKey'}
                                               className='custom-control-input'
                                               value='importHexKey'
                                               onChange={this.handleChange}
                                        />
                                        <label className='custom-control-label' htmlFor='keyType2'>{t('ImportKeyInHex')}</label>
                                    </div>
                                    <div className='custom-control custom-radio'>
                                        <input type='radio'
                                               name='keyType'
                                               id='keyType3'
                                               defaultChecked={this.keyType==='importJsonKey'}
                                               className='custom-control-input'
                                               value='importJsonKey'
                                               onChange={this.handleChange}
                                        />
                                        <label className='custom-control-label' htmlFor='keyType3'>{t('ImportFromJSON')}</label>
                                    </div>
                                </div>
                            </div>
                            <div className='form-group text-right m-t-40'>
                                <NextButton onSubmit={this.onSubmit.bind(this)} />
                            </div>
                        </section>
                    </div>
                </div>
            </form>
        </div>;
    }
}

export default withRouter(SetAccount);
