import * as React from 'react';
import { NavLink } from 'react-router-dom';

export default function(props:any){



        return (<div className='left side-menu'>
            <div className='sidebar-inner slimscrollleft'>
                <div id='sidebar-menu'>
                    <ul>
                        <li className=''>
                            <NavLink exact to='/app' activeClassName='active' className='waves-effect'><i className='ti-home'></i><span> Dashboard </span></NavLink>
                        </li>
                        <li className='has_sub'>
                            <NavLink to='/sessions' activeClassName='active' className='waves-effect'><i className='md md-list'></i> <span> Services </span> <span className='menu-arrow'></span></NavLink>
                            <ul className='list-unstyled'>
                                <li><NavLink exact to='/sessions' activeClassName='active' className='waves-effect'>Active</NavLink></li>
                                <li><NavLink exact to='/sessions' activeClassName='active' className='waves-effect'>Archive</NavLink></li>
                                <li><NavLink exact to='/sessions' activeClassName='active' className='waves-effect'>Sessions</NavLink></li>
                            </ul>
                        </li>
                        <li className=''>
                            <NavLink exact to='/offerings/all' activeClassName='active' className='waves-effect'><i className='md md-toc'></i><span> Offerings </span></NavLink>
                        </li>
                        <li className=''>
                            <NavLink exact to='/products' activeClassName='active' className='waves-effect'><i className='md md-toc'></i><span> Products </span></NavLink>
                        </li>
                        <li className=''>
                            <NavLink exact to='/templates' activeClassName='active' className='waves-effect'><i className='md md-toc'></i><span> Templates </span></NavLink>
                        </li>
                        <li className=''>
                            <NavLink exact to='/logs' activeClassName='active' className='waves-effect'><i className='dripicons-blog'></i><span> Logs </span></NavLink>
                        </li>
                        <li className=''>
                            <NavLink exact to='/createOffering' activeClassName='active' className='waves-effect'><i className='md md-toc'></i><span> create Offering </span></NavLink>
                        </li>
                    </ul>
                    <div className='clearfix'></div>
                </div>
                <div className='clearfix'></div>
            </div>
        </div>);
    }

