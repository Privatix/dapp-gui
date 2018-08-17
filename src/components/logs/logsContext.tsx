import * as React from 'react';

export default class LogsContext extends React.Component <any, any> {

    constructor(props: any) {
        super(props);

        this.state = {
            contextTableData: null
        };
    }

    componentDidMount() {
        const context = JSON.parse(atob(this.props.context));

        let contextTableData = Object.keys(context).map((i) => {
            return <tr key={i}><td>{i}</td><td>{context[i]}</td></tr>;
        });

        this.setState({contextTableData});
    }

    render() {
        return <div>
            <table className='table table-striped-custom table-bordered table-hover'>
                <thead>
                    <tr>
                        <th>Key</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.contextTableData}
                </tbody>
            </table>
        </div>;
    }
}
