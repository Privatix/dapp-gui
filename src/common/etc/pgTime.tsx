import * as React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import { State } from 'typings/state';

interface IProps {
    lang?: string;
    time: string;
}

class PgTime extends React.Component<IProps, {}> {

    render() {

        const { time, lang } = this.props;

        if (time) {
            moment.locale(lang);

            const date = new Date(Date.parse(time));
            let formattedDate = moment(date).format('MMM D YYYY HH:mm:ss');
            if (lang === 'ru') {
                moment.updateLocale('ru', {
                    monthsShort : {
                        format: 'Янв_Фев_Мар_Апр_Мая_Июня_Июля_Авг_Сен_Окт_Ноя_Дек'.split('_'),
                        standalone: 'Янв_Фев_Март_Апр_Май_Июнь_Июль_Авг_Сен_Окт_Ноя_Дек'.split('_')
                    }
                });
                formattedDate = moment(date).format('D MMM YYYY HH:mm:ss');
            }

            return <span>{formattedDate}</span>;
        } else {
            return <span></span>;
        }
    }
}

export default connect( (state: State, ownProps: IProps) => {
    return Object.assign({}
                        ,{lang: state.localSettings.lang}
                        ,ownProps
                        );
} )(PgTime);
