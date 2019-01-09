import * as React from 'react';
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import {valid, gt } from 'semver';

import DoNotShowUpdateNotificationButton from './doNotShowUpdateNotification';
import GoToUpdateButton from './goToUpdateButton';

import {State} from 'typings/state';

@translate('updateInformer')
class UpdateInformer extends React.Component<any, any>{

    render(){

        const { localSettings, dbSettings } = this.props;
        console.log('DB SETTINGS!!!', dbSettings);
        const { release: releaseVersion, target, releases } = localSettings;

        if(!valid(releaseVersion)){
            return null;
        }

        const versions = Object.keys(releases);
        if(!versions.length){
            return null;
        }

        const max = versions.reduce((max, version) => {
            if(!valid(version)){
               return max;
            }
            if(!gt(version, max)){
               return max;
            }
            if(!('platforms' in releases[version]) || target === '' || !(target in releases[version].platforms)){
               return max;
            }
            if(!('minVersion' in releases[version].platforms[target]) || gt(releases[version].platforms[target].minVersion, max)){
                return max;
            }
            return version;
        }, releaseVersion);

        if(max === releaseVersion){
            return null;
        }

        if(!dbSettings){
            return null;
        }

        if('updateDismissVersion' in dbSettings){
            if(!gt(max, dbSettings.updateDismissVersion)){
                return null;
            }
        }

        const release = releases[max];
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
                            <div style={ {margin: '10px'} } >New version {{name: version}} was released.</div>
                        </Trans>
                        <GoToUpdateButton href={release.html_url} />
                        <DoNotShowUpdateNotificationButton version={max} />
                    </div>
                </li>
            </ul>
        );
    }
}
export default connect( (state: State) => ({localSettings: state.localSettings, dbSettings: state.settings}) )(UpdateInformer);
