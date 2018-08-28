import * as React from 'react';
import { translate } from 'react-i18next';

@translate('logs/logsContext')

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
        const { t } = this.props;

        return <div>
            <table className='table table-striped-custom table-bordered table-hover'>
                <thead>
                    <tr>
                        <th>{t('Key')}</th>
                        <th>{t('Value')}</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.contextTableData}
                </tbody>
            </table>
        </div>;
    }
}
