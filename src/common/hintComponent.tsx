import * as React from 'react';

interface IProps {
    msg: string | JSX.Element;
}

export default class HintComponent extends React.Component<IProps, {}> {

    render() {

        const { msg } = this.props;

        return (
            <table>
                <tbody>
                <tr>
                    <td style={ {verticalAlign: 'top', width: '30' } } >
                        <i className='fa fa-info-circle' style={ {fontSize:'22px', color: 'deepskyblue', marginRight:'10px'} }></i>
                    </td>
                    <td>
                        <p>{ msg }</p>
                    </td>
                </tr>
                </tbody>
            </table>
        );
    }

}
