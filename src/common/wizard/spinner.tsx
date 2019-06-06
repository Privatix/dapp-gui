import * as React from 'react';

export default class Spinner extends React.Component<{},{}> {

    render(){

        return (
            <div className='text-center m-t-15 m-b-15'>
                <div className='lds-dual-ring'></div>
            </div>
        );
    }
}
