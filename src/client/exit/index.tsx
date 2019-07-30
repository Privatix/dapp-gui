import * as React from 'react';

import DotProgress from 'common/progressBars/dotProgress';
import ExternalLink from 'common/etc/externalLink';

import { I18nextProvider} from 'react-i18next';
import i18n from 'i18next/init';

export default class Exit extends React.Component<{}, {}> {

    render() {

        return (
            <div className='startingServiceWrap'>
                <I18nextProvider i18n={ i18n }>
                    <div style={ {textAlign: 'center', margin: 'auto'} }>
                        <h6>{ i18n.t('start:servicesAreStopping') }<DotProgress /></h6>

                        <div className='text-center m-t-15 m-b-15'>
                            <div className='lds-dual-ring'></div>
                        </div>

                        <div>{ i18n.t('start:UsuallyItTakes') }</div>
                        <div>{ i18n.t('start:IfSomethingWentWrong') }</div>&nbsp;
                        <ExternalLink href='https://privatix.atlassian.net/wiki/spaces/BVP/pages/297304077/How+to+detect+a+trouble+cause'>
                            { i18n.t('start:HowToDetectATroubleCause') }
                        </ExternalLink>
                    </div>
                </I18nextProvider>
            </div>
        );
    }
}

