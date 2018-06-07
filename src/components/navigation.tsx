import * as React from 'react';
import { NavLink } from 'react-router-dom';
declare var window: any;
interface Props {
    mode: string;
}


export default class Navigation extends React.Component<Props, any> {

    constructor(props: Props) {
        super(props);
        this.state = {mode: props.mode};
    }

    componentDidUpdate() {
        // const $ = (window as any).jQuery;
        // $.App.init();
        // $.Sidemenu.init();
    }
    componentDidMount(){
         const $ = (window as any).jQuery;
         $.App.init();
        [].slice.call(document.querySelectorAll('#sidebar-menu a')).forEach(function(elem: HTMLAnchorElement) {
            var pageUrl = window.location.href.split(/[?#]/)[0];
            if (elem.href === pageUrl) { 
                $(elem).addClass('active');
                $(elem).parent().addClass('active'); // add active to li of the current link
                $(elem).parent().parent().prev().addClass('active'); // add active class to an anchor
                $(elem).parent().parent().prev().click(); // click the item to make it drop
            }
        });
        setTimeout(()=>{
            // const $ = (window as any).jQuery;
            // $.Sidemenu.init();
        }, 1000);
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: any){
        console.log('PROPS!!!', nextProps, prevState);
        return {mode: nextProps.mode};
    }

    render(){
        setTimeout(function(){
            const $ = (window as any).jQuery;
            $.Sidemenu.init();
        }, 1000);
        return this.state.mode === undefined || this.state.mode === 'agent' ? <div className='left side-menu'>
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
        :
        <div className='left side-menu'>
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
                            <NavLink exact to='/accept-offering' activeClassName='active' className='waves-effect'>
                                <i className='md md-toc'></i><span> Accept offering </span>
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
            </div>
        </div>;
    }
}
