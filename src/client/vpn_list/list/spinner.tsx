import * as React from 'react';
import { connect } from 'react-redux';
import { withTranslation, Trans } from 'react-i18next';

import {State} from 'typings/state';

const translated = withTranslation(['client/vpnList']);

class Spinner extends React.Component<any,any> {

    render(){

        const { t, serviceName } = this.props;

        return (
            <div className='container-fluid'>
                <div className='row m-t-20'>
                    <div className='col-12'>
                        <div className='card'>
                            <div className='col-4 m-b-20'>
                                <div className='card-body'>
                                    <p className='font-25'>{t('WaitForDownloading')}</p>
                                    <div className='text-center m-t-15 m-b-15'>
                                        <div className='lds-dual-ring'></div>
                                    </div>
                                    <p className='m-b-0'>
                                        <Trans i18nKey='CurrentlyWeAreDownloading' values={{serviceName}} >
                                             Currently, we are downloading {{serviceName}} list.
                                         </Trans>
                                    </p>
                                    <p>{t('TakesTimeOnFirstRun')}</p>
                                    <p className='m-t-15'>{t('AverageTimeForDownloading')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect((state: State) => ({serviceName: state.serviceName}))(translated(Spinner));
