import * as React from 'react';
import { translate } from 'react-i18next';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const translated = translate('logs/logsList');

interface IProps {
    t?: any;
    blockClass: string;
    label: string;
    id: string;
    selected: any;
    lang: string;
    showNowBtn?: boolean;
    handleChangeDate(evt: any): void;
    handleNow?(evt: any): void;
}

function timeFilter(props: IProps) {
    const { t } = props;

    let nowBtn = null;

    if (props.showNowBtn) {
        nowBtn = <button className='btn btn-white waves-effect m-l-15 p-t-7 p-b-8' onClick={props.handleNow}>{t('NowBtn')}</button>;
    }

    return (
        <div className={`col-xl-3 col-lg-12 col-md-6 col-sm-12 col-xs-12 col-12 ${props.blockClass}`}>
            <div className='form-group row'>
                <label className='col-md-2 col-2 col-form-label text-right'>{props.label}</label>
                <div className='col-md-10 col-10'>
                    <div className='input-group'>
                        <DatePicker
                            id={props.id}
                            selected={props.selected}
                            showTimeSelect
                            timeFormat='HH:mm'
                            timeIntervals={10}
                            dateFormat='h:mm A DD-MMM-YY'
                            timeCaption={t('LogsFilterTime')}
                            className='form-control form-control-datepicker'
                            onChange={props.handleChangeDate}
                            locale={props.lang}
                        />
                        <label className='input-group-append input-group-append-label' htmlFor={props.id}>
                            <span className='input-group-text input-group-text-bordered'><i className='md md-event-note'></i></span>
                        </label>

                        {nowBtn}

                    </div>
                </div>
            </div>
        </div>
    );
}

export default translated(timeFilter);
