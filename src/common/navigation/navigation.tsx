import * as React from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import {Role} from '../../typings/mode';
import {State} from '../../typings/state';
import Submenu from './submenu';

import './navigation.css';

interface Props {
    mode: Role;
    t: any;
}

@translate(['navigation'])
class Navigation extends React.Component<Props, any> {

    constructor(props: Props) {
        super(props);

        const { t } = props;

        this.state = {
            submenu: false,
            activeSub: null,
            channelsSubmenuData: {
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
            },
            offeringsSubmenuData: {
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
            }
        };
    }

    changeActive = (activeSub: any)=>{
        this.setState({activeSub});
    }


    handleClickFalse() {
        this.setState({submenu: false, activeSub: null});
    }

    render() {
        const { t } = this.props;

        return this.props.mode === Role.AGENT ? <div className='left side-menu'>
            <div className='sidebar-inner slimscrollleft'>
                <div id='sidebar-menu'>
                    <ul>
                        <li onClick={this.handleClickFalse.bind(this)} className=''>
                            <NavLink exact to='/' activeClassName='active' className='waves-effect'>
                                <i className='ti-home'></i><span> {t('Dashboard')} </span>
                            </NavLink>
                        </li>

                        <Submenu submenuData={this.state.channelsSubmenuData} active={this.state.activeSub} onClick={this.changeActive}/>

                        <Submenu submenuData={this.state.offeringsSubmenuData} active={this.state.activeSub} onClick={this.changeActive} />

                        <li onClick={this.handleClickFalse.bind(this)} className=''>
                            <NavLink exact to='/products' activeClassName='active' className='waves-effect'>
                                <i className='fa fa-server'></i><span> {t('Servers')} </span>
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
                        <li onClick={this.handleClickFalse.bind(this)} className=''>
                            <NavLink exact to='/client-dashboard-start' activeClassName='active' className='waves-effect'>
                                <i className='ti-home'></i><span> {t('ClientDashboard')} </span>
                            </NavLink>
                        </li>
                        <li className=''>
                            <NavLink exact to='/client-vpn-list' activeClassName='active' className='waves-effect'>
                                <i className='md md-toc'></i><span> {t('VPNList')} </span>
                            </NavLink>
                        </li>
                        <li className=''>
                            <NavLink exact to='/client-history' activeClassName='active' className='waves-effect'>
                                <i className='fa fa-history'></i><span> {t('History')} </span>
                            </NavLink>
                        </li>
                    </ul>
                    <div className='clearfix'></div>
                </div>
            </div>
        </div>;
    }
}

export default withRouter(connect( (state: State) => ({mode: state.mode}) )(Navigation));
