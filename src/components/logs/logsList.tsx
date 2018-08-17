import * as React from 'react';
import * as api from '../../utils/api';
import {fetch} from '../../utils/fetch';
import ModalWindow from '../modalWindow';
import SortableTable from 'react-sortable-table-vilan';
import DateSorter from '../utils/sorters/sortingDate';
import DatePicker from 'react-datepicker';
import moment from 'moment/src/moment';
import LogsTime from '../utils/logsTime';
import LogsStack from './logsStack';
import LogsContext from './logsContext';
import {LocalSettings} from '../../typings/settings';
import {remote} from 'electron';
const {dialog} = remote;
import Pagination from 'react-js-pagination';
import notice from '../../utils/notice';
import 'react-datepicker/dist/react-datepicker.css';

class Logs extends React.Component <any,any> {

    constructor(props:any) {
        super(props);

        this.state = {
            logsData: null,
            logsDataExport: null,
            logsDataArr: [],
            dateFrom: moment().subtract(1, 'day'),
            dateTo: moment(),
            logsPerPage: 10,
            activePage: 1,
            pages: 1,
            levels: []
        };
    }

    componentDidMount() {
        this.getLogsData();
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

    async getLogsPerPage() {
        const settings = (await api.settings.getLocal()) as LocalSettings;

        return settings.logsCountPerPage;
    }

    async getLogsData(dateFrom:any = null, dateTo:any = null, levels:string[] = []) {
        const dateFromData = dateFrom === null ? this.state.dateFrom : dateFrom;
        const dateToData = dateTo === null ? this.state.dateTo : dateTo;

        const isoDateFrom = new Date(dateFromData).toISOString();
        const isoDateTo = new Date(dateToData).toISOString();
        const logsPerPage = await this.getLogsPerPage();

        // form query params
        let query = [];
        query.push(`perPage=${logsPerPage}`);
        query.push(`page=${this.state.activePage}`);
        query.push(`dateFrom=${isoDateFrom}`);
        query.push(`dateTo=${isoDateTo}`);
        if (levels.length > 0 || this.state.levels.length > 0) {
            const levelsData = levels.length > 0 ? levels : this.state.levels;
            query.push(`level=${levelsData.join(',')}`);
        }

        const logs = await api.logs.getLogs(query.join('&'));

        const logsDataArr = [];
        (logs.items as any).map(log => {
            let context = atob(log.Context);

            let row = {
                level: log.Level,
                date: log.Time,
                message: log.Message,
                context: context !== '{}' ? <ModalWindow customClass='btn btn-link waves-effect' modalTitle='Context' text='show' component={<LogsContext context={log.Context} />} /> : '',
                stack:  log.Stack !== null ? <ModalWindow customClass='btn btn-link waves-effect' modalTitle='Stack trace:' text='show' component={<LogsStack context={log.Stack} />} /> : ''
            };

            logsDataArr.push(row);
        });

        const activePage = logs.pages === 1 ? 1 : this.state.activePage;

        this.setState({
            logsData: logs.items,
            logsDataArr,
            logsPerPage,
            pages: logs.pages,
            activePage
        });
    }

    getLogsDataExport() {
        return (this.state.logsData as any).map(log => {
            return [
                log.Time,
                log.Level,
                '"' + log.Message.replace(/"/, '\"\"') + '"',
                atob(log.Context),
                log.Stack !== null ? '"' + log.Stack.replace(/"/, '\"\"') + '"' : ''
            ];
        });
    }

    handleChangeLevel(evt:any) {
        const level = evt.target.dataset.level;

        const levels = this.state.levels;
        if (levels.indexOf(level) === -1) {
            levels.push(level);
        } else {
            levels.splice(levels.indexOf(level), 1);
        }

        this.setState({levels});
        this.getLogsData(null, null, levels);
    }

    handleChangeDateFrom(date: any) {
        this.alertOnBigDateRangeSelect(date, this.state.dateTo);
        this.setState({
            dateFrom: date
        });
        this.getLogsData(date);
    }

    handleChangeDateTo(date: any) {
        this.alertOnBigDateRangeSelect(this.state.dateFrom, date);
        this.setState({
            dateTo: date
        });
        this.getLogsData(null, date);
    }

    handleNow() {
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

    exportToFile() {
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
            notice({
                level: 'warning',
                title: 'Warning!',
                msg: 'Please, don\'t select logs in more than 5 days. It can take a lot of time!'
            });
        }
    }

    render() {

        const columns = [
            {
                header: 'Level',
                key: 'level',
                render: (level) => {
                    return <span className={`label label-table label-${this.labelClasses[level]}`}>{level}</span>;
                }
            },
            {
                header: 'Date',
                key: 'date',
                descSortFunction: DateSorter.desc,
                ascSortFunction: DateSorter.asc,
                render: (date) => <LogsTime time={date} />
            },
            {
                header: 'Message',
                key: 'message',
                sortable: false
            },
            {
                header: 'Context',
                key: 'context',
                sortable: false
            },
            {
                header: 'Stack',
                key: 'stack',
                sortable: false

            }
        ];

        return (
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-sm-12 m-b-15'>
                        <h3 className='page-title'>Logs list</h3>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-12'>
                        <div className='card-box'>
                            <div>
                                <button className='btn btn-default btn-custom waves-effect waves-light m-b-30'
                                    onClick={this.exportToFile.bind(this)}>Export to a file</button>
                            </div>
                            {/*<div className='form-group row'>*/}
                                {/*<div className='col-md-12 m-t-10 m-b-10'>*/}
                                    {/*<div className='input-group searchInputGroup'>*/}
                                        {/*<div className='input-group-prepend'>*/}
                                            {/*<span className='input-group-text'><i className='fa fa-search'></i></span>*/}
                                        {/*</div>*/}
                                        {/*<input className='form-control' type='search' name='search' placeholder='search'/>*/}
                                    {/*</div>*/}
                                {/*</div>*/}
                            {/*</div>*/}
                            <div className='row m-b-20'>
                                <div className='col-xl-5 col-lg-12 col-md-12 col-sm-12 col-xs-12 button-list m-b-10 logsLevelFilterBl'>
                                    <button className={'btn btn-primary btn-rounded waves-effect waves-light w-xs' +
                                        (this.state.levels.length > 0 && this.state.levels.indexOf('debug') === -1 ? ' btn-custom btn-custom-rounded' : '')}
                                            onClick={this.handleChangeLevel.bind(this)} data-level='debug'>debug</button>
                                    <button className={'btn btn-success btn-rounded waves-effect waves-light w-xs' +
                                        (this.state.levels.length > 0 && this.state.levels.indexOf('info') === -1 ? ' btn-custom btn-custom-rounded' : '')}
                                            onClick={this.handleChangeLevel.bind(this)} data-level='info'>info</button>
                                    <button className={'btn btn-warning btn-rounded waves-effect waves-light w-xs' +
                                        (this.state.levels.length > 0 && this.state.levels.indexOf('warning') === -1 ? ' btn-custom btn-custom-rounded' : '')}
                                            onClick={this.handleChangeLevel.bind(this)} data-level='warning'>warning</button>
                                    <button className={'btn btn-pink btn-rounded waves-effect waves-light w-xs' +
                                        (this.state.levels.length > 0 && this.state.levels.indexOf('error') === -1 ? ' btn-custom btn-custom-rounded' : '')}
                                            onClick={this.handleChangeLevel.bind(this)} data-level='error'>error</button>
                                    <button className={'btn btn-danger btn-rounded waves-effect waves-light w-xs' +
                                        (this.state.levels.length > 0 && this.state.levels.indexOf('fatal') === -1 ? ' btn-custom btn-custom-rounded' : '')}
                                            onClick={this.handleChangeLevel.bind(this)} data-level='fatal'>fatal</button>
                                </div>
                                <div className='col-xl-3 col-lg-12 col-md-6 col-sm-12 col-xs-12 col-12 logsTimeFilterFromBl'>
                                    <div className='form-group row'>
                                        <label className='col-md-2 col-2 col-form-label text-right'>From:</label>
                                        <div className='col-md-10 col-10'>
                                            <div className='input-group'>
                                                <DatePicker
                                                    selected={this.state.dateFrom}
                                                    showTimeSelect
                                                    timeFormat='HH:mm'
                                                    timeIntervals={10}
                                                    dateFormat='h:mm A DD-MMM-YY'
                                                    timeCaption='time'
                                                    className='form-control form-control-datepicker'
                                                    onChange={this.handleChangeDateFrom.bind(this)}
                                                />
                                                <div className='input-group-append'>
                                                    <span className='input-group-text'><i className='md md-event-note'></i></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-xl-4 col-lg-12 col-md-6 col-sm-12 col-xs-12 col-12 logsTimeFilterToBl'>
                                    <div className='form-group row'>
                                        <label className='col-md-2 col-2 col-form-label text-right'>To:</label>
                                        <div className='col-md-10 col-10'>
                                            <div className='input-group'>
                                                <DatePicker
                                                    selected={this.state.dateTo}
                                                    showTimeSelect
                                                    timeFormat='HH:mm'
                                                    timeIntervals={10}
                                                    dateFormat='h:mm A DD-MMM-YY'
                                                    timeCaption='time'
                                                    className='form-control form-control-datepicker'
                                                    onChange={this.handleChangeDateTo.bind(this)}
                                                />
                                                
                                                <div className='input-group-append'>
                                                    <span className='input-group-text input-group-text-bordered'><i className='md md-event-note'></i></span>
                                                </div>

                                                <button className='btn btn-white waves-effect m-l-15 p-t-7 p-b-8' onClick={this.handleNow.bind(this)}>Now</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='bootstrap-table bootstrap-table-sortable'>
                                <SortableTable
                                    data={this.state.logsDataArr}
                                    columns={columns}/>
                            </div>

                            <div>
                                <Pagination
                                    activePage={this.state.activePage}
                                    itemsCountPerPage={this.state.logsPerPage}
                                    totalItemsCount={this.state.logsPerPage * this.state.pages}
                                    pageRangeDisplayed={10}
                                    onChange={this.handlePageChange.bind(this)}
                                    prevPageText='‹'
                                    nextPageText='›'
                                />
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Logs;
