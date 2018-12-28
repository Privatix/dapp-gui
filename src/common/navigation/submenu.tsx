import * as React from 'react';
import { NavLink, withRouter } from 'react-router-dom';

class Submenu extends React.Component<any, any> {
    constructor(props: any) {
        super(props);

        this.state = {
            opened: false,
            data: props.submenuData,
        };
    }

    handleClick() {
        this.setState((oldState) => {
            return {opened: !oldState.opened};
        });
    }

    handleClickTrue() {
        this.setState({opened: true});
    }

    render() {
        const mainLink = this.state.data.mainLink;
        const sublinksCount = this.state.data.sublinks.length;

        return <li className='has_sub' aria-current={this.state.opened ? 'page' : null}>
            <div onClick={this.handleClick.bind(this)}>
                <NavLink to={mainLink.link} activeClassName='active' className='waves-effect'>
                    <i className='fa fa-tasks'></i> <span> {mainLink.text} </span> <span className='menu-arrow'></span>
                </NavLink>
            </div>
            <ul className={'list-unstyled sub_menu sub_menu_' + sublinksCount}>
                {this.state.data.sublinks.map((sublink) =>
                    <li key={sublink.link} onClick={this.handleClickTrue.bind(this)}>
                        <NavLink activeClassName='active_sub' exact to={sublink.link} className='waves-effect'>{sublink.text}</NavLink>
                    </li>
                )}
            </ul>
        </li>;
    }
}

export default withRouter(Submenu);
