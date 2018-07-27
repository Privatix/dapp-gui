import * as React from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';
import {Mode} from '../typings/mode';
import {State} from '../typings/state';

// declare var window: any;

interface Props {
    mode: Mode;
}

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
        return this.props.mode === Mode.AGENT ? <div className='left side-menu'>
            <div className='sidebar-inner slimscrollleft'>
                <div id='sidebar-menu'>
                    <ul>

                        <li onClick={this.handleClickFalse.bind(this)} className=''>
                            <NavLink exact to='/' activeClassName='active' className='waves-effect'>
                                <i className='ti-home'></i><span> Dashboard </span>
                            </NavLink>
                        </li>

                        <li className='has_sub' aria-current={this.state.submenu ? 'page' : null}>
                            <div onClick={this.handleClick.bind(this)}>
                                <NavLink to='/channels/all' activeClassName='active' className='waves-effect'>
                                    <i className='fa fa-exchange'></i> <span> Services </span> <span className='menu-arrow'></span>
                                </NavLink>
                            </div>
                            <ul className='list-unstyled sub_menu'>
                                <li onClick={this.handleClickTrue.bind(this)}><NavLink activeClassName='active_sub' exact to='/channelsByStatus/active' className='waves-effect'>Active</NavLink></li>
                                <li onClick={this.handleClickTrue.bind(this)}><NavLink activeClassName='active_sub' exact to='/channelsByStatus/terminated' className='waves-effect'>History</NavLink></li>
                                <li onClick={this.handleClickTrue.bind(this)}><NavLink activeClassName='active_sub' exact to='/sessions/all' className='waves-effect'>Sessions</NavLink></li>
                            </ul>
                        </li>

                        <li onClick={this.handleClickFalse.bind(this)} className=''>
                            <NavLink exact to='/offerings/all' activeClassName='active' className='waves-effect'>
                                <i className='fa fa-superpowers'></i><span> Offerings </span>
                            </NavLink>
                        </li>

                        <li onClick={this.handleClickFalse.bind(this)} className=''>
                            <NavLink exact to='/products' activeClassName='active' className='waves-effect'>
                                <i className='fa fa-server'></i><span> Servers </span>
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
                                <i className='ti-home'></i><span> Client Dashboard </span>
                            </NavLink>
                        </li>
                        <li className=''>
                            <NavLink exact to='/client-vpn-list' activeClassName='active' className='waves-effect'>
                                <i className='md md-toc'></i><span> VPN List </span>
                            </NavLink>
                        </li>
                        {/*<li className=''>*/}
                            {/*<NavLink exact to='/vpn-history' activeClassName='active' className='waves-effect'>*/}
                                {/*<i className='md md-toc'></i><span> Connection offering </span>*/}
                            {/*</NavLink>*/}
                        {/*</li>*/}
                        <li className=''>
                            <NavLink exact to='/client-history' activeClassName='active' className='waves-effect'>
                                <i className='fa fa-history'></i><span> History </span>
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
