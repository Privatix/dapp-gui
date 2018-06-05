import * as React from 'react';
import { NavLink } from 'react-router-dom';

export default function AsyncNavigation(props:any){

    return props.mode === undefined || props.mode === 'agent' ? <div className='left side-menu'>
        <div className='sidebar-inner slimscrollleft'>
            <div id='sidebar-menu'>
                <ul>
                    <li className=''>
                        <NavLink exact to='/' activeClassName='active' className='waves-effect'>
                            <i className='ti-home'></i><span> Dashboard </span>
                        </NavLink>
                    </li>
                    <li className='has_sub'>
                        <NavLink to='/channels/all' activeClassName='active' className='waves-effect'>
                            <i className='md md-list'></i> <span> Services </span> <span className='menu-arrow'></span>
                        </NavLink>
                        <ul className='list-unstyled'>
                            <li><NavLink exact to='/channelsByStatus/active' activeClassName='active' className='waves-effect'>Active</NavLink></li>
                            <li><NavLink exact to='/channelsByStatus/terminated' activeClassName='active' className='waves-effect'>Archive</NavLink></li>
                            <li><NavLink exact to='/sessions/all' activeClassName='active' className='waves-effect'>Sessions</NavLink></li>
                        </ul>
                    </li>
                    <li className=''>
                        <NavLink exact to='/offerings/all' activeClassName='active' className='waves-effect'>
                            <i className='md md-toc'></i><span> Offerings </span>
                        </NavLink>
                    </li>
                    <li className=''>
                        <NavLink exact to='/products' activeClassName='active' className='waves-effect'>
                            <i className='md md-toc'></i><span> Servers </span>
                        </NavLink>
                    </li>
                </ul>
                <div className='clearfix'></div>
            </div>
            <div className='clearfix'></div>
        </div>
    </div>
    : <div className='left side-menu'>
        <div className='sidebar-inner slimscrollleft'>
            <div id='sidebar-menu'>
                <ul>
                    <li className=''>
                        <NavLink exact to='/client-dashboard-start' activeClassName='active' className='waves-effect'>
                            <i className='ti-home'></i><span> Client Dashboard </span>
                        </NavLink>
                    </li>
                    <li className=''>
                        <NavLink exact to='/client-vpn-list' activeClassName='active' className='waves-effect'>
                            <i className='md md-toc'></i><span> VPN List </span>
                        </NavLink>
                    </li>
                    <li className=''>
                        <NavLink exact to='/client-history' activeClassName='active' className='waves-effect'>
                            <i className='md md-toc'></i><span> History </span>
                        </NavLink>
                    </li>
                </ul>
                <div className='clearfix'></div>
            </div>
            <div className='clearfix'></div>
        </div>
    </div>;
}
