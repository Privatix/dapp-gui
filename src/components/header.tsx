import * as React from 'react';
// import { Link } from 'react-router-dom';
import { NavLink } from 'react-router-dom';


export default function(props:any){

    /* Draft status logic (Need to change incomeStatus by real status) */
    let status = 'on';
    let incomeStatus = 1;
    if (incomeStatus !== 1) {
        status = 'off';
    }

    return <div className='topbar'>

        <div className='topbar-left'>
            <div className='text-center'>
                <NavLink to='/' className='logo'><i
                    className='icon-c-logo md md-local-parking'></i><span id='h'>Privatix</span></NavLink>
            </div>
        </div>
        <nav className='navbar-custom'>

            <ul className='list-inline float-right mb-0'>

                <li className='list-inline-item dropdown notification-list'>
                    <a className='nav-link dropdown-toggle waves-effect waves-light nav-user' data-toggle='dropdown'
                       href='#' role='button'
                       aria-haspopup='false' aria-expanded='false'>
                        <img src='images/PrivatixIcon.jpg' alt='user' className='rounded-circle' />
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
                            <NavLink exact to='/logs' activeClassName='active' className='dropdown-item notify-item'>
                                <i className='dripicons-blog'></i><span>Logs</span>
                            </NavLink>
                        </div>
                </li>

                <a className='nav-link waves-light waves-effect' href='#' id='btn-fullscreen'>
                    <i className='dripicons-expand noti-icon'></i>
                </a>
            </ul>

            <ul className='list-inline float-right mb-0 topPanel'>
                <li className='list-inline-item m-r-20'>ETH Balance: 0.4</li>
                <li className='list-inline-item m-r-20'>Exchange Balance: 35</li>
                <li className='list-inline-item m-r-20'>Service balance: 35</li>
                <li className='list-inline-item m-r-20'>Active Services: 2</li>
                <li className='list-inline-item m-r-20 topPanelStatusLi'> Status: <span className={'statusWrap statusWrap-' + status}><i className={'fa fa-toggle-' + status}></i></span></li>
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
