import * as React from 'react';

interface IProps {
    context: any;
}

interface IState {

}

export default class LogsStack extends React.Component <IProps, IState> {

    render() {
        return <div>
            <pre className='padding20'>{this.props.context}</pre>
        </div>;
    }
}
