import * as React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import TopPanel from './topPanel';
import UpdateInformer from './updateInformer/';

import {State} from 'typings/state';

declare var window: any;

@translate(['header', 'utils/notice'])
class Header extends React.Component<any, any>{

    constructor(props:any){
        super(props);
    }

    launchFullscreen(element: any) {
        if(element.requestFullscreen) {
            element.requestFullscreen();
        } else if(element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }
    }

    exitFullscreen() {
        if(document.exitFullscreen) {
            document.exitFullscreen();
        } else if((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
        }
    }

    toggleFullScreen() {
        var fullscreenEnabled = (document as any).fullscreenEnabled || (document as any).webkitFullscreenEnabled;
        if(fullscreenEnabled) {
            if(!(document as any).fullscreenElement && !(document as any).webkitFullscreenElement) {
                this.launchFullscreen(document.documentElement);
            } else{
                this.exitFullscreen();
            }
        }
    }

    openLeftBar() {
        const $ = (window as any).jQuery;
        $('#wrapper').toggleClass('enlarged');
        $('#wrapper').addClass('forced');

        if($('#wrapper').hasClass('enlarged') && $('body').hasClass('fixed-left')) {
            $('body').removeClass('fixed-left').addClass('fixed-left-void');
        } else if(!$('#wrapper').hasClass('enlarged') && $('body').hasClass('fixed-left-void')) {
            $('body').removeClass('fixed-left-void').addClass('fixed-left');
        }

        if($('#wrapper').hasClass('enlarged')) {
            $('.left ul').removeAttr('style');
        } else {
            $('.subdrop').siblings('ul:first').show();
        }

        $('body').trigger('resize');
    }

    openHelpLink(evt:any) {
        evt.preventDefault();
        require('electron').shell.openExternal('https://privatix.atlassian.net/wiki/spaces/BVP/pages/297304077/How+to+detect+a+trouble+cause');
    }

    render(){

        const { t } = this.props;

        const style = {
            padding: '5px',
            color: 'rgb(12, 102, 121)',
            backgroundColor: 'rgb(255, 255, 255)',
            fontSize: '33px',
            verticalAlign: 'middle',
            lineHeight: '0.9'
        };
        return <div className='topbar'>

            <div className='topbar-left'>
                <div className='text-center'>
                    <NavLink to='/' className='logo'>
                        <i className='icon-c-logo'>
                            <img src='images/logo@2x_small.png' className='smallLogoImg' />
                        </i>
                        <span><img src='images/logo@2x.png' className='fullLogoImg' /></span>
                    </NavLink>
                </div>
            </div>
            <nav className='navbar-custom'>

                <ul className='list-inline float-right mb-0'>

                    <li className='list-inline-item dropdown notification-list'>
                        <a className='nav-link dropdown-toggle waves-effect waves-light nav-user' data-toggle='dropdown'
                           href='#' role='button'
                           aria-haspopup='false' aria-expanded='false'>
                            <i className='fa fa-gear rounded-circle' style={style}></i>
                        </a>
                            <div className='dropdown-menu dropdown-menu-right profile-dropdown ' aria-labelledby='Preview'>
                                <NavLink to='/accounts' className='dropdown-item notify-item'>
                                    <i className='md  md-account-child'></i> <span>{t('Accounts')}</span>
                                </NavLink>
                                <a onClick={this.openHelpLink.bind(this)} className='dropdown-item notify-item cursorPoiner'>
                                    <i className='md md-help'></i> <span>{t('Help')}</span>
                                </a>
                                <NavLink to='/settings' className='dropdown-item notify-item'>
                                    <i className='md md-settings'></i> <span>{t('Settings')}</span>
                                </NavLink>
                            </div>
                    </li>

                    <a className='nav-link waves-light waves-effect' href='#' onClick={this.toggleFullScreen.bind(this)} >
                        <i className='dripicons-expand noti-icon'></i>
                    </a>
                </ul>

                <UpdateInformer />
                <TopPanel />
                <ul className='list-inline menu-left mb-0'>
                    <li className='float-left'>
                        <button onClick={this.openLeftBar.bind(this)} className='button-menu-mobile open-left waves-light waves-effect'>
                            <i className='dripicons-menu'></i>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>;
    }
}

export default connect( (state: State) => ({mode: state.mode}) )(withRouter(Header));
