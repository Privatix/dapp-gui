import * as React from 'react';
import { connect } from 'react-redux';
import { WithTranslation, withTranslation, Trans } from 'react-i18next';
import {valid, gt } from 'semver';

import DoNotShowUpdateNotificationButton from './doNotShowUpdateNotification';
import GoToUpdateButton from './goToUpdateButton';

import {State} from 'typings/state';

interface IProps extends WithTranslation {
    localSettings: State['localSettings'];
    dbSettings: State['settings'];
}

const translate = withTranslation('updateInformer');

class UpdateInformer extends React.Component<IProps, {}>{

    render(){

        const { localSettings, dbSettings } = this.props;
        const { release: releaseVersion, latestReleaseChecked } = localSettings;

        if(!valid(releaseVersion)){
            return null;
        }
        if(!latestReleaseChecked || !valid(latestReleaseChecked.tag_name)){
            return null;
        }

        if(latestReleaseChecked.tag_name === releaseVersion){
            return null;
        }

        if(!dbSettings){
            return null;
        }

        if(valid(dbSettings.updateDismissVersion)){
            if(!gt(latestReleaseChecked.tag_name, dbSettings.updateDismissVersion)){
                return null;
            }
        }

        const release = latestReleaseChecked;
        const version = release.name ? release.name : release.tag_name;

        const styles = {
            backgroundColor: 'rgb(255, 255, 255)',
            color: 'rgb(12, 102, 121)',
            padding: '5px',
            fontSize: '28px',
            verticalAlign: 'middle'
        };

        return (
            <ul className='list-inline float-right mb-0'>
                <li className='list-inline-item dropdown notification-list'>
                    <a className='nav-link dropdown-toggle waves-effect waves-light nav-user' data-toggle='dropdown'
                       href='#' role='button'
                       aria-haspopup='false' aria-expanded='false'>
                        <i className='fa fa-download rounded-circle' style={styles} />
                    </a>
                    <div className='dropdown-menu dropdown-menu-right profile-dropdown ' aria-labelledby='Preview'>
                        <Trans i18nKey='announcement' values={{name: version}}>
                            <div style={ {margin: '10px'} } >New version <b>{{name: version}}</b> was released.</div>
                        </Trans>
                        <GoToUpdateButton href={release.html_url} />
                        <DoNotShowUpdateNotificationButton version={release.tag_name} />
                    </div>
                </li>
            </ul>
        );
    }
}

export default connect( (state: State) => ({localSettings: state.localSettings, dbSettings: state.settings}) )(translate(UpdateInformer));
