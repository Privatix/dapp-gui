import * as React from 'react';
import { NavLink, withRouter } from 'react-router-dom';

class Submenu extends React.Component<any, any> {

    handleClick() {
        if(this.props.onClick){
            this.props.onClick(this);
        }
    }

    render() {
        const mainLink = this.props.submenuData.mainLink;
        const sublinksCount = this.props.submenuData.sublinks.length;

        return <li className='has_sub' aria-current={this.props.active === this ? 'page' : null}>
            <div onClick={this.handleClick.bind(this)}>
                <NavLink to={mainLink.link} activeClassName='active' className='waves-effect'>
                    <i className='fa fa-tasks'></i> <span> {mainLink.text} </span> <span className='menu-arrow'></span>
                </NavLink>
            </div>
            <ul className={'list-unstyled sub_menu sub_menu_' + sublinksCount}>
                {this.props.submenuData.sublinks.map((sublink) =>
                    <li key={sublink.link} onClick={this.handleClick.bind(this)}>
                        <NavLink activeClassName='active_sub' exact to={sublink.link} className='waves-effect'>{sublink.text}</NavLink>
                    </li>
                )}
            </ul>
        </li>;
    }
}

export default withRouter(Submenu);
