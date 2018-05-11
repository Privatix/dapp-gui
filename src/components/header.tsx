import * as React from 'react';
// import { Link } from 'react-router-dom';
import { NavLink } from 'react-router-dom';


export default function(props:any){
    return <div className='topbar'>


        <div className='topbar-left'>
            <div className='text-center'>
                <NavLink to='/' className='logo'><i
                    className='icon-c-logo md md-local-parking'></i><span id='h'>Privatix</span></NavLink>
            </div>
        </div>
        <nav className='navbar-custom'>

            <ul className='list-inline float-right mb-0'>

                <li className='list-inline-item notification-list'>
                    <a className='nav-link waves-light waves-effect' href='#'>
                        <i className='dripicons-bell noti-icon'></i>
                    </a>
                </li>

                <li className='list-inline-item dropdown notification-list'>
                    <a className='nav-link dropdown-toggle waves-effect waves-light nav-user' data-toggle='dropdown'
                       href='#' role='button'
                       aria-haspopup='false' aria-expanded='false'>
                        <img src='images/avatar-1.jpg' alt='user' className='rounded-circle' />
                    </a>
                        <div className='dropdown-menu dropdown-menu-right profile-dropdown ' aria-labelledby='Preview'>
                            <NavLink to='/accounts' className='dropdown-item notify-item'>
                                <i className='md  md-account-child'></i> <span>Accounts</span>
                            </NavLink>
                            <NavLink to='#' className='dropdown-item notify-item'>
                                <i className='md md-help'></i> <span>Help</span>
                            </NavLink>
                            <NavLink to='/settings' className='dropdown-item notify-item'>
                                <i className='md md-settings'></i> <span>Settings</span>
                            </NavLink>
                        </div>
                </li>

                <a className='nav-link waves-light waves-effect' href='#' id='btn-fullscreen'>
                    <i className='dripicons-expand noti-icon'></i>
                </a>
            </ul>

            <ul className='list-inline float-right mb-0 topPanel'>
                <li className='list-inline-item'>ETH Balance: 0.4</li>
                <li className='list-inline-item'>Exchange Balance: 35</li>
                <li className='list-inline-item'>Service balance: 35</li>
                <li className='list-inline-item'>Active Services: 2</li>
                <li className='list-inline-item'> Status:</li>
            </ul>

            <ul className='list-inline menu-left mb-0'>
                <li className='float-left'>
                    <button className='button-menu-mobile open-left waves-light waves-effect'>
                        <i className='dripicons-menu'></i>
                    </button>
                </li>
            </ul>
        </nav>
    </div>;
}
