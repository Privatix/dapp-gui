import * as React from 'react';

export default class SelectCountryOption extends React.Component<any, {}> {

    onClick = () => {
        this.props.onSelect(this.props.option);
    }

    render(){
        const { label, value, cost } = this.props.option;
        return (
            <div onClick={this.onClick} style={ {display: 'flex', justifyContent: 'space-between'} } >
                <img src={`images/country/${value}.png`}
                     width='30px'
                     height='20px'
                     style={ {alignSelf: 'center', marginLeft: '5px'} }
                 />
                 <span style={ {margin: '5px',
                                maxWidth: '150px',
                                display: 'inline-block',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap'
                 } } >{label}</span><span style={ {margin: '5px'} } >{cost}</span>
            </div>
        );
    }
}
