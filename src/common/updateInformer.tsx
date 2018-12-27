import * as React from 'react';
import { connect } from 'react-redux';
import {valid, gt } from 'semver';

import ExternalLink from 'common/etc/externalLink';

import { translate, Trans } from 'react-i18next';
import {State} from 'typings/state';

@translate('updateInformer')
class UpdateInformer extends React.Component<any, any>{

    render(){

        const { releases, localSettings } = this.props;

        if(!valid(localSettings.release)){
            return null;
        }

        if(!releases.length){
            return null;
        }

        const versions = releases.map(release => release.tag_name);
        const max = versions.reduce((max, version) => valid(version) ? (gt(version, max) ? version : max) : max, localSettings.release);

        if(max === localSettings.release){
            return null;
        }

        const release = releases.find(release => release.tag_name === max);

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
                        <ExternalLink href={release.html_url}>
                            <Trans i18nKey='announcement' values={{name: release.name}}>
                                <div style={ {margin: '10px'} } >New version {{name: release.name}} was released.</div>
                            </Trans>
                        </ExternalLink>
                    </div>
                </li>
            </ul>
        );
    }
}
export default connect( (state: State) => ({releases: state.releases, localSettings: state.localSettings}) )(UpdateInformer);
