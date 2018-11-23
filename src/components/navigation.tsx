import * as React from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';
import {Role} from '../typings/mode';
import {State} from '../typings/state';

// declare var window: any;

interface Props {
    mode: Role;
    t: any;
}

@translate(['navigation'])
class Navigation extends React.Component<Props, any> {

    constructor(props: Props) {
        super(props);
        this.state = {
            submenu: false,
        };
    }

    handleClick() {
        this.setState((oldState) => {
            return {submenu: !oldState.submenu};
        });
    }

    handleClickTrue() {
        this.setState({submenu: true});
    }

    handleClickFalse() {
        this.setState({submenu: false});
    }

    render(){

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

                        <li className='has_sub' aria-current={this.state.submenu ? 'page' : null}>
                            <div onClick={this.handleClick.bind(this)}>
                                <NavLink to='/channels' activeClassName='active' className='waves-effect'>
                                    <i className='fa fa-tasks'></i> <span> {t('Services')} </span> <span className='menu-arrow'></span>
                                </NavLink>
                            </div>
                            <ul className='list-unstyled sub_menu'>
                                <li onClick={this.handleClickTrue.bind(this)}>
                                    <NavLink activeClassName='active_sub' exact to='/channelsByStatus/active' className='waves-effect'>{t('Active')}</NavLink>
                                </li>
                                <li onClick={this.handleClickTrue.bind(this)}>
                                    <NavLink activeClassName='active_sub' exact to='/channelsByStatus/terminated' className='waves-effect'>{t('History')}</NavLink>
                                </li>
                                <li onClick={this.handleClickTrue.bind(this)}>
                                    <NavLink activeClassName='active_sub' exact to='/sessions/all' className='waves-effect'>{t('Sessions')}</NavLink>
                                </li>
                            </ul>
                        </li>

                        <li onClick={this.handleClickFalse.bind(this)} className=''>
                            <NavLink exact to='/offerings/all' activeClassName='active' className='waves-effect'>
                                <i className='ion-network'></i><span> {t('Offerings')} </span>
                            </NavLink>
                        </li>

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
                        {/*<li className=''>*/}
                            {/*<NavLink exact to='/vpn-history' activeClassName='active' className='waves-effect'>*/}
                                {/*<i className='md md-toc'></i><span> Connection offering </span>*/}
                            {/*</NavLink>*/}
                        {/*</li>*/}
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
