import * as React from 'react';

interface IProps {
    context: any;
}

export default class LogsStack extends React.Component <IProps, {}> {

    render() {
        return <div>
            <pre className='padding20'>{this.props.context}</pre>
        </div>;
    }
}
