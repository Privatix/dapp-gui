import * as React from 'react';

import toFixed from 'utils/toFixedN';

export default class OfferingInfo extends React.Component<any, {}> {

    render(){

        const { offering } = this.props;

        return (offering
            ? <table className='table table-sm' style={ {margin: 'auto',  width: '300px'} }>
                <tbody>
                <tr>
                    <td style={ {border: '0'} }>Price per MB: </td>
                    <td style={ {border: '0'} }>{`${toFixed({number: offering.unitPrice/1e8, fixed: 8})} PRIX`}</td>
                </tr>
                <tr>
                    <td style={ {paddingBottom: '0px'} }>Max. traffic:</td>
                    <td style={ {paddingBottom: '0px'} }>{offering.maxUnit ? `${offering.maxUnit} ${offering.unitName}` : 'unlimited' }</td>
                </tr>
                </tbody>
            </table>
            : null
        );
    }
}
