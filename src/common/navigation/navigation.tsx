import * as React from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';
import { translate, Trans } from 'react-i18next';
import {Role} from 'typings/mode';
import {State} from 'typings/state';
import Submenu from './submenu';

import './navigation.css';

interface Props {
    role: Role;
    t: any;
    serviceName: string;
    location: any;
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

    render() {
        const { t, role, serviceName, location } = this.props;
        const { activeSub } = this.state;

        const headerNavigationItems = ['/accounts', '/settings'];
        const useSub = headerNavigationItems.includes(location.pathname) ? null : activeSub;

        return role === Role.AGENT ? <div className='left side-menu'>
            <div className='sidebar-inner slimscrollleft'>
                <div id='sidebar-menu'>
                    <ul>
                        <li onClick={this.handleClickFalse} className=''>
                            <NavLink exact to='/' activeClassName='active' className='waves-effect'>
                                <i className='ti-home'></i><span> {t('Dashboard')} </span>
                            </NavLink>
                        </li>

                        <Submenu submenuData={this.channelsSubmenuData} active={useSub} onClick={this.changeActive}/>

                        <Submenu submenuData={this.offeringsSubmenuData} active={useSub} onClick={this.changeActive} />

                        <li onClick={this.handleClickFalse} className=''>
                            <NavLink exact to='/products' activeClassName='active' className='waves-effect'>
                                <i className='fa fa-server'></i><span> {t('Servers')} </span>
                            </NavLink>
                        </li>

                        <li onClick={this.handleClickFalse} className=''>
                            <NavLink exact to='/logs' activeClassName='active' className='dropdown-item notify-item'>
                                <i className='dripicons-blog'></i><span>{t('Logs')}</span>
                            </NavLink>
                        </li>
                    </ul>
                    <div className='clearfix'></div>
                </div>
                <div className='clearfix'></div>
            </div>
        </div>
        :
        <div className='left side-menu'>
            <div className='sidebar-inner slimscrollleft'>
                <div id='sidebar-menu'>
                    <ul>
                        <li onClick={this.handleClickFalse} className=''>
                            <NavLink exact to='/client-dashboard-start' activeClassName='active' className='waves-effect'>
                                <i className='ti-home'></i><span> {t('ClientDashboard')} </span>
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
                                <i className='fa fa-history'></i><span> {t('History')} </span>
                            </NavLink>
                        </li>
                        <li onClick={this.handleClickFalse} className=''>
                            <NavLink exact to='/logs' activeClassName='active' className='dropdown-item notify-item'>
                                <i className='dripicons-blog'></i><span>{t('Logs')}</span>
                            </NavLink>
                        </li>
                    </ul>
                    <div className='clearfix'></div>
                </div>
            </div>
        </div>;
    }
}

export default withRouter(connect( (state: State) => ({role: state.role, serviceName: state.serviceName}) )(Navigation));
