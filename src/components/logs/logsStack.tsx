import * as React from 'react';

export default class LogsStack extends React.Component <any, any> {

    constructor(props: any) {
        super(props);
    }

    render() {
        return <div>
            <pre className='padding20'>{this.props.context}</pre>
        </div>;
    }
}
