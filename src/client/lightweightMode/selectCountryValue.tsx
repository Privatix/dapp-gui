import * as React from 'react';

export default function(props: any){

    const { label, value } = props;

    return (
        <span style={ {display: 'flex', justifyContent: 'flex-start', lineHeight: 'normal'} } >
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
             } } >{label}</span>
        </span>
    );
}
