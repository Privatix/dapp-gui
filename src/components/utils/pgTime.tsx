import * as React from 'react';
import * as moment from 'moment';
import * as api from '../../utils/api';
import {LocalSettings} from '../../typings/settings';

export default class PgTime extends React.Component<any, any> {

    constructor(props: any) {
        super(props);

        this.state = {lang:''};
    }

    async componentDidMount() {
        const lang = await this.getActiveLang();
        this.setState({lang});
    }

    async getActiveLang() {
        const settings = (await api.settings.getLocal()) as LocalSettings;
        return settings.lang;
    }

    render() {
        if (this.props.time) {
            moment.locale(this.state.lang);

            const date = new Date(Date.parse(this.props.time));
            const formattedDate = moment(date).format('MMM D YYYY HH:mm:ss');

            return <span>{formattedDate}</span>;
        } else {
            return <span></span>;
        }
    }
}
