import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import * as moment from 'moment';
import Pagination from 'react-js-pagination';
import {remote} from 'electron';
const {dialog} = remote;

import SortableTable from 'react-sortable-table-vilan';

import * as api from 'utils/api';
import {fetch} from 'utils/fetch';
import notice from 'utils/notice';

import ModalWindow from 'common/modalWindow';
import DateSorter from 'common/sorters/sortingDate';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import LogsTime from 'common/etc/logsTime';
import LogsStack from './logsStack';
import LogsContext from './logsContext';

import {LocalSettings} from 'typings/settings';
import {State} from 'typings/state';

@translate(['logs/logsList', 'common'])

class Logs extends React.Component <any,any> {

    constructor(props:any) {
        super(props);

        this.state = {
            logsData: null,
            logsDataExport: null,
            logsDataArr: [],
            dateFrom: moment().subtract(1, 'day'),
            dateTo: moment(),
            searchText: '',
            logsPerPage: 10,
            activePage: 1,
            pages: 1,
            offset: 0,
            totalItems: 0,
            levels: [],
            lang: null
        };
    }

    componentDidMount() {
        this.getLogsData();
        this.getActiveLang();
    }

    get labelClasses() {
        return {
            debug: 'primary',
            info: 'success',
            warning: 'warning',
            error: 'pink',
            fatal: 'danger'
        };
    }

    async getSettings() {
        return (await api.settings.getLocal()) as LocalSettings;
    }

    async getActiveLang() {
        const settings = await this.getSettings();
        this.setState({lang: settings.lang});
    }

    async getLogsData(dateFrom:any = null, dateTo:any = null, levels:string[] = []) {
        const dateFromData = dateFrom === null ? this.state.dateFrom : dateFrom;
        const dateToData = dateTo === null ? this.state.dateTo : dateTo;
        const settings = await this.getSettings();

        // getLogs params
        const isoDateFrom = new Date(dateFromData).toISOString();
        const isoDateTo = new Date(dateToData).toISOString();
        const searchText = this.state.searchText !== '' ? this.state.searchText : '';
        const levelsData = this.state.levels.length > 0 ? this.state.levels : [];
        const logsPerPage = settings.logsCountPerPage;
        const offset = this.state.activePage > 1 ? (this.state.activePage - 1) * logsPerPage : this.state.offset;

        const logs = await this.props.ws.getLogs(levelsData, searchText, isoDateFrom, isoDateTo, offset, logsPerPage);

        const { t } = this.props;

        const logsDataArr = [];
        if (logs.totalItems > 0) {
            (logs.items as any).map(log => {
                let row = {
                    level: log.level,
                    date: log.time,
                    message: log.message,
                    context: log.context !== '{}' ?
                        <ModalWindow customClass='btn btn-link waves-effect' modalTitle={t('Context')}
                                     text={t('ShowBtn')} component={<LogsContext context={log.context}/>}/> : '',
                    stack: log.stack !== null ?
                        <ModalWindow customClass='btn btn-link waves-effect' modalTitle={t('StackTrace')}
                                     text={t('ShowBtn')} component={<LogsStack context={log.stack}/>}/> : ''
                };

                logsDataArr.push(row);
            });
        }

        const pages = Math.ceil(logs.totalItems / logsPerPage);
        const activePage = pages === 1 ? 1 : this.state.activePage;

        this.setState({
            logsData: logs.items,
            logsDataArr,
            logsPerPage,
            pages,
            activePage,
            totalItems: logs.totalItems
        });
    }

    getLogsDataExport() {
        if (this.state.logsData === null) {
            return [];
        }

        return (this.state.logsData as any).map(log => {
            return [
                log.time,
                log.level,
                '"' + log.message.replace(/"/g, '\"\"') + '"',
                '"' + JSON.stringify(log.context).replace(/"/g, '\"\"') + '"',
                log.stack !== null ? '"' + log.stack.replace(/"/g, '\"\"') + '"' : ''
            ];
        });
    }

    resetActivePage() {
        this.setState({activePage: 1});
    }

    handleChangeLevel = (evt:any) => {
        const level = evt.target.dataset.level;

        const levels = this.state.levels;
        if (levels.indexOf(level) === -1) {
            levels.push(level);
        } else {
            levels.splice(levels.indexOf(level), 1);
        }

        this.resetActivePage();

        this.setState({levels});
        this.getLogsData(null, null, levels);
    }

    handleChangeDateFrom(date: any) {
        this.resetActivePage();
        this.alertOnBigDateRangeSelect(date, this.state.dateTo);
        this.setState({
            dateFrom: date
        });
        this.getLogsData(date);
    }

    handleChangeDateTo(date: any) {
        this.resetActivePage();
        this.alertOnBigDateRangeSelect(this.state.dateFrom, date);
        this.setState({
            dateTo: date
        });
        this.getLogsData(null, date);
    }

    handleNow() {
        this.resetActivePage();
        const date = moment();
        this.setState({
            dateTo: date
        });
        this.getLogsData(null, date);
    }

    handlePageChange(pageNumber:number) {
        this.setState({activePage: pageNumber});
        this.getLogsData();
    }

    handleSearch = (evt:any) => {
        this.resetActivePage();
        if (evt.key === 'Enter') {
            const searchText = evt.target.value;
            this.setState({searchText});
            this.getLogsData();
        }
    }

    handleChangeSearch = (evt:any) => {
        this.setState({searchText: evt.target.value});
    }

    handleClearSearch = () => {
        this.resetActivePage();
        let searchText = this.state.searchText;
        if (searchText !== '') {
            searchText = '';
            this.setState({searchText});
            this.getLogsData();
        }
    }

    exportToFile = () => {
        (dialog.showSaveDialog as any)(null, {
            title: 'Saving logs',
            defaultPath: 'logs.csv'
        }, (fileName: string) => {
            if (fileName != null) {
                const headers = ['time', 'level', 'message', 'context', 'stack'];
                const data = this.getLogsDataExport();
                data.unshift(headers);
                fetch('/saveAs', {body: {fileName, data: data.map(row => row.join(',')).join('\n')}});
            }
        });
    }

    alertOnBigDateRangeSelect(dateFrom:string, dateTo:string) {
        if (moment(dateTo, 'M/D/YYYY').diff(moment(dateFrom, 'M/D/YYYY'), 'days') > 5) {
            const { t } = this.props;
            notice({
                level: 'warning',
                msg: t('WarningDateMessage')
            });
        }
    }

    render() {
        const { t } = this.props;

        const columns = [
            {
                header: t('Level'),
                key: 'level',
                render: (level) => {
                    return <span className={`label label-table label-${this.labelClasses[level]}`}>{level}</span>;
                }
            },
            {
                header: t('Date'),
                key: 'date',
                dataProps: {className: 'minWidth160'},
                descSortFunction: DateSorter.desc,
                ascSortFunction: DateSorter.asc,
                render: (date) => <LogsTime time={date} lang={this.state.lang} />
            },
            {
                header: t('Message'),
                key: 'message',
                sortable: false
            },
            {
                header: t('Context'),
                key: 'context',
                sortable: false
            },
            {
                header: t('Stack'),
                key: 'stack',
                sortable: false

            }
        ];

        const pagination = this.state.totalItems <= this.state.logsPerPage ? '' :
            <Pagination
                activePage={this.state.activePage}
                itemsCountPerPage={this.state.logsPerPage}
                totalItemsCount={this.state.totalItems}
                pageRangeDisplayed={10}
                onChange={this.handlePageChange.bind(this)}
                prevPageText='‹'
                nextPageText='›'
            />;

        const noResults = this.state.totalItems === 0 ?
            <p className='text-warning text-center m-t-20 m-b-20'>{t('common:NoResults')}</p>
            : '';

        return (
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-sm-12 m-b-15'>
                        <h3 className='page-title'>{t('LogsHeader')}</h3>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-12'>
                        <div className='card-box'>
                            <div>
                                <button className='btn btn-default btn-custom waves-effect waves-light m-b-30'
                                    onClick={this.exportToFile}>{t('ExportBtn')}</button>
                            </div>
                            <div className='form-group row'>
                                <div className='col-md-12 m-t-10 m-b-10'>
                                    <div className='input-group searchInputGroup'>
                                        <div className='input-group-prepend'>
                                            <span className='input-group-text'><i className='fa fa-search'></i></span>
                                        </div>
                                        <input className='form-control logsSearchInput' type='search' name='query'
                                               placeholder={t('LogsSearchPlaceholder')} value={this.state.searchText}
                                               onKeyPress={this.handleSearch}
                                               onChange={this.handleChangeSearch} />
                                        <div className={'searchClear' + (this.state.searchText === '' ? ' hidden' : '')}>
                                            <button className='btn btn-icon waves-effect waves-light btn-danger'
                                                    onClick={this.handleClearSearch}>
                                                <i className='fa fa-remove'></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='row m-b-20'>
                                <div className='col-xl-5 col-lg-12 col-md-12 col-sm-12 col-xs-12 button-list m-b-10 logsLevelFilterBl'>
                                    <button className={'btn btn-primary btn-rounded waves-effect waves-light w-xs' +
                                        (this.state.levels.length > 0 && this.state.levels.indexOf('debug') === -1 ? ' btn-custom btn-custom-rounded' : '')}
                                            onClick={this.handleChangeLevel} data-level='debug'>debug</button>
                                    <button className={'btn btn-success btn-rounded waves-effect waves-light w-xs' +
                                        (this.state.levels.length > 0 && this.state.levels.indexOf('info') === -1 ? ' btn-custom btn-custom-rounded' : '')}
                                            onClick={this.handleChangeLevel} data-level='info'>info</button>
                                    <button className={'btn btn-warning btn-rounded waves-effect waves-light w-xs' +
                                        (this.state.levels.length > 0 && this.state.levels.indexOf('warning') === -1 ? ' btn-custom btn-custom-rounded' : '')}
                                            onClick={this.handleChangeLevel} data-level='warning'>warning</button>
                                    <button className={'btn btn-pink btn-rounded waves-effect waves-light w-xs' +
                                        (this.state.levels.length > 0 && this.state.levels.indexOf('error') === -1 ? ' btn-custom btn-custom-rounded' : '')}
                                            onClick={this.handleChangeLevel} data-level='error'>error</button>
                                    <button className={'btn btn-danger btn-rounded waves-effect waves-light w-xs' +
                                        (this.state.levels.length > 0 && this.state.levels.indexOf('fatal') === -1 ? ' btn-custom btn-custom-rounded' : '')}
                                            onClick={this.handleChangeLevel} data-level='fatal'>fatal</button>
                                </div>
                                <div className='col-xl-3 col-lg-12 col-md-6 col-sm-12 col-xs-12 col-12 logsTimeFilterFromBl'>
                                    <div className='form-group row'>
                                        <label className='col-md-2 col-2 col-form-label text-right'>{t('LogsFilterFrom')}</label>
                                        <div className='col-md-10 col-10'>
                                            <div className='input-group'>
                                                <DatePicker
                                                    id={'dateFrom'}
                                                    selected={this.state.dateFrom}
                                                    showTimeSelect
                                                    timeFormat='HH:mm'
                                                    timeIntervals={10}
                                                    dateFormat='h:mm A DD-MMM-YY'
                                                    timeCaption={t('LogsFilterTime')}
                                                    className='form-control form-control-datepicker'
                                                    onChange={this.handleChangeDateFrom.bind(this)}
                                                    locale={this.state.lang}
                                                />
                                                <label className='input-group-append input-group-append-label' htmlFor='dateFrom'>
                                                    <span className='input-group-text input-group-text-bordered'><i className='md md-event-note'></i></span>
                                                </label>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-xl-4 col-lg-12 col-md-6 col-sm-12 col-xs-12 col-12 logsTimeFilterToBl'>
                                    <div className='form-group row'>
                                        <label className='col-md-2 col-2 col-form-label text-right'>{t('LogsFilterTo')}</label>
                                        <div className='col-md-10 col-10'>
                                            <div className='input-group'>
                                                <DatePicker
                                                    id={'dateTo'}
                                                    selected={this.state.dateTo}
                                                    showTimeSelect
                                                    timeFormat='HH:mm'
                                                    timeIntervals={10}
                                                    dateFormat='h:mm A DD-MMM-YY'
                                                    timeCaption={t('LogsFilterTime')}
                                                    className='form-control form-control-datepicker'
                                                    onChange={this.handleChangeDateTo.bind(this)}
                                                    locale={this.state.lang}
                                                />

                                                <label className='input-group-append input-group-append-label' htmlFor='dateTo'>
                                                    <span className='input-group-text input-group-text-bordered'><i className='md md-event-note'></i></span>
                                                </label>

                                                <button className='btn btn-white waves-effect m-l-15 p-t-7 p-b-8' onClick={this.handleNow.bind(this)}>{t('NowBtn')}</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='bootstrap-table bootstrap-table-sortable m-b-30'>
                                <SortableTable
                                    data={this.state.logsDataArr}
                                    columns={columns}/>

                                {noResults}
                            </div>

                            <div>{pagination}</div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect( (state: State) => ({ws: state.ws}) )(Logs);
