import * as React from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';
import { asyncProviders } from 'redux/actions';
import { Dispatch } from 'redux';
import { translate, Trans } from 'react-i18next';
import {Mode, Role} from 'typings/mode';
import {State} from 'typings/state';
import Submenu from './submenu';

import './navigation.css';
import ExternalLink from 'common/etc/externalLink';
import NetworkAndVersion from 'common/networkAndVersion';

interface Props {
    role: Role;
    mode: Mode;
    t: any;
    serviceName: string;
    location: any;
    setSimpleMode?(): void;
}

@translate(['navigation'])
class Navigation extends React.Component<Props, any> {

    constructor(props: Props) {
        super(props);

        this.state = {
            submenu: false,
            activeSub: null
        };
    }


    private get channelsSubmenuData(){

        const { t } = this.props;

        return {
            mainLink: {
                link: '/channels',
                text: t('Services')
            },
            sublinks: [
                {
                    link: '/channelsByStatus/active',
                    text: t('Active')
                },
                {
                    link: '/channelsByStatus/terminated',
                    text: t('History')
                },
                {
                    link: '/sessions/all',
                    text: t('Sessions')
                }
            ]
        };
    }

    private get offeringsSubmenuData(){

        const { t } = this.props;

        return {
            mainLink: {
                link: '/offerings/all',
                text: t('Offerings')
            },
            sublinks: [
                {
                    link: '/offeringsByStatus/active',
                    text: t('Active')
                },
                {
                    link: '/offeringsByStatus/history',
                    text: t('History')
                }
            ]
        };
    }

    changeActive = (activeSub: any)=>{
        this.setState({activeSub});
    }


    handleClickFalse = () => {
        this.setState({submenu: false, activeSub: null});
    }

    setLighweightMode = (evt:any) => {
        const { setSimpleMode } = this.props;
        evt.preventDefault();
        setSimpleMode();
    }

    render() {
        const { t, role, serviceName, location } = this.props;
        const { activeSub } = this.state;

        const headerNavigationItems = ['/accounts', '/settings'];
        const useSub = headerNavigationItems.includes(location.pathname) ? null : activeSub;

        const commonLinks = <>
            <li onClick={this.handleClickFalse} className=''>
                <NavLink exact to='/logs' activeClassName='active' className='waves-effect'>
                    <i className='dripicons-blog'></i><span>{t('Logs')}</span>
                </NavLink>
            </li>
            <li onClick={this.handleClickFalse} className=''>
                <NavLink exact to='/jobs' activeClassName='active' className='waves-effect'>
                    <i className='dripicons-blog'></i><span>{t('Jobs')}</span>
                </NavLink>
            </li>
            <li onClick={this.handleClickFalse} className=''>
                <NavLink exact to='/transactions' activeClassName='active' className='waves-effect'>
                    <i className='dripicons-blog'></i><span>{t('Transactions')}</span>
                </NavLink>
            </li>
            <li onClick={this.handleClickFalse} className='separator'>
                <NavLink to='/accounts' className='waves-effect'>
                    <i className='md  md-account-child'></i> <span>{t('Accounts')}</span>
                </NavLink>
            </li>
            <li onClick={this.handleClickFalse} className=''>
                <ExternalLink
                    className='waves-effect cursorPoiner'
                    href={'https://docs.privatix.network/support/feedback/how-to-detect-a-trouble-cause'}
                ><i className='md md-help'></i> <span>{t('Help')}</span></ExternalLink>
            </li>
            <li onClick={this.handleClickFalse} className=''>
                <NavLink to='/settings' className='waves-effect'>
                    <i className='md md-settings'></i> <span>{t('Settings')}</span>
                </NavLink>
            </li>
        </>;


        return role === Role.AGENT ? <div className='left side-menu'>
            <div className='sidebar-inner slimscrollleft'>
                <div id='sidebar-menu'>
                    <ul>
                        <li onClick={this.handleClickFalse} className=''>
                            <NavLink exact to='/' activeClassName='active' className='waves-effect'>
                                <i className='ti-home'></i><span>{t('Dashboard')}</span>
                            </NavLink>
                        </li>

                        <Submenu submenuData={this.channelsSubmenuData} active={useSub} onClick={this.changeActive}/>

                        <Submenu submenuData={this.offeringsSubmenuData} active={useSub} onClick={this.changeActive} />

                        {commonLinks}
                    </ul>
                    <div className='clearfix'></div>
                </div>
                <div className='clearfix'></div>
                <NetworkAndVersion className='networkANdBuildVersionAdvanced' />
            </div>
        </div>
        :
        <div className='left side-menu'>
            <div className='sidebar-inner slimscrollleft'>
                <div id='sidebar-menu'>
                    <ul>
                        <li onClick={this.handleClickFalse} className=''>
                            <NavLink exact to='/client-dashboard-start' activeClassName='active' className='waves-effect'>
                                <i className='ti-home'></i><span>{t('ClientDashboard')}</span>
                            </NavLink>
                        </li>
                        <li className=''>
                            <NavLink exact to='/client-vpn-list' activeClassName='active' className='waves-effect'>
                                <i className='md md-toc'></i>
                                <span>
                                    <Trans i18nKey='ServiceList' values={{serviceName}} >
                                        { {serviceName} } list
                                    </Trans>
                                </span>
                            </NavLink>
                        </li>
                        <li className=''>
                            <NavLink exact to='/client-history' activeClassName='active' className='waves-effect'>
                                <i className='fa fa-history'></i><span>{t('History')}</span>
                            </NavLink>
                        </li>

                        {commonLinks}

                        <li onClick={this.handleClickFalse} className=''>
                            <a onClick={this.setLighweightMode} className='waves-effect cursorPoiner'>
                                <i className='md md-swap-horiz'></i> <span>Simple Mode</span>
                            </a>
                        </li>
                    </ul>
                    <div className='clearfix'></div>
                </div>
                <NetworkAndVersion className='networkANdBuildVersionAdvanced' />
            </div>
        </div>;
    }
}

const mapStateToProps = (state: State) => {
    const { role, mode } = state;
    return { role, mode, serviceName: state.serviceName };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => ({
    setSimpleMode: () => {
        dispatch(asyncProviders.setMode(Mode.SIMPLE));
    }
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Navigation));
