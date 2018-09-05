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

        const contextTableData = this.renderContextTableRows(context);
        this.setState({contextTableData});
    }

    renderContextTableRows(context:object, counter:number = 0) {
        const paddingClass = 'paddingLeft' + counter * 50;
        counter++;

        return Object.keys(context).map((i) => {
            if (context[i] !== null && typeof context[i] === 'object') {
                return ([
                    <tr key={i}><td className={paddingClass}>{i}</td><td></td></tr>,
                    this.renderContextTableRows(context[i], counter)
                ]);
            } else {
                return <tr key={i}><td className={paddingClass}>{i}</td><td>{context[i]}</td></tr>;
            }
        });
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
