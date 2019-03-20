import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import * as moment from 'moment';
import Pagination from 'react-js-pagination';
import {remote} from 'electron';
const {dialog} = remote;

import * as api from 'utils/api';
import notice from 'utils/notice';

import ModalWindow from 'common/modalWindow';

import LogsStack from './logsStack';
import LogsContext from './logsContext';

import {State} from 'typings/state';
import { Log } from 'typings/logs';

import ExportBtns from './blocks/exportBtns';
import Search from './blocks/search';
import LevelsFilter from './blocks/levelsFilter';
import TimeFilter from './blocks/timeFilter';
import LogsTable from './blocks/table';

interface IProps {
    t?: any;
    localSettings: State['localSettings'];
    ws: State['ws'];
}

interface IState {
    logsData: Log[];
    logsDataExport: any;
    logsDataArr: any[];
    dateFrom: any;
    dateTo: any;
    searchText: string;
    logsPerPage: number;
    activePage: number;
    pages: number;
    offset: number;
    totalItems: number;
    levels: string[];
    lang: string;
}

@translate(['logs/logsList', 'common'])
class Logs extends React.Component <IProps, IState> {

    constructor(props:IProps) {

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

    async getActiveLang() {
        const { localSettings } = this.props;
        this.setState({lang: localSettings.lang});
    }

    async getLogsData(dateFrom:any = null, dateTo:any = null, levels:string[] = []) {

        const { localSettings, t, ws } = this.props;

        const dateFromData = dateFrom === null ? this.state.dateFrom : dateFrom;
        const dateToData = dateTo === null ? this.state.dateTo : dateTo;

        // getLogs params
        const isoDateFrom = new Date(dateFromData).toISOString();
        const isoDateTo = new Date(dateToData).toISOString();
        const searchText = this.state.searchText !== '' ? this.state.searchText : '';
        const levelsData = this.state.levels.length > 0 ? this.state.levels : [];
        const logsPerPage = localSettings.logsCountPerPage;
        const offset = this.state.activePage > 1 ? (this.state.activePage - 1) * logsPerPage : this.state.offset;

        const logs = await ws.getLogs(levelsData, searchText, isoDateFrom, isoDateTo, offset, logsPerPage);

        const logsDataArr = [];
        if (logs.totalItems > 0) {
            logs.items.map(log => {
                const row = {
                    level: log.level,
                    date: [log.time, this.state.lang],
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

    handleChangeDateFrom = (date: any) => {
        this.resetActivePage();
        this.alertOnBigDateRangeSelect(date, this.state.dateTo);
        this.setState({
            dateFrom: date
        });
        this.getLogsData(date);
    }

    handleChangeDateTo = (date: any) => {
        this.resetActivePage();
        this.alertOnBigDateRangeSelect(this.state.dateFrom, date);
        this.setState({
            dateTo: date
        });
        this.getLogsData(null, date);
    }

    handleNow = () => {
        this.resetActivePage();
        const date = moment();
        this.setState({
            dateTo: date
        });
        this.getLogsData(null, date);
    }

    handlePageChange = (pageNumber:number) => {
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

    exportControllerLogsToFile = () => {
        (dialog.showSaveDialog as any)(null, {
            title: 'Saving logs',
            defaultPath: 'logs.csv'
        }, (fileName: string) => {
            if (fileName != null) {
                const headers = ['time', 'level', 'message', 'context', 'stack'];
                const data = this.getLogsDataExport();
                data.unshift(headers);
                api.fs.saveAs(fileName, data.map(row => row.join(',')).join('\n'));
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
        const { totalItems
              , logsPerPage
              , activePage
              , searchText
              , levels
              , dateFrom
              , dateTo
              , lang
              , logsDataArr } = this.state;

        const pagination = totalItems <= logsPerPage ? '' :
            <Pagination
                activePage={activePage}
                itemsCountPerPage={logsPerPage}
                totalItemsCount={totalItems}
                pageRangeDisplayed={10}
                onChange={this.handlePageChange}
                prevPageText='‹'
                nextPageText='›'
            />;

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

                            <ExportBtns exportControllerLogsToFile={this.exportControllerLogsToFile} />

                            <Search
                                searchText={searchText}
                                handleSearch={this.handleSearch}
                                handleChangeSearch={this.handleChangeSearch}
                                handleClearSearch={this.handleClearSearch}
                            />

                            <div className='row m-b-20'>

                                <LevelsFilter levels={levels} handleChangeLevel={this.handleChangeLevel} />

                                <TimeFilter
                                    blockClass='logsTimeFilterFromBl'
                                    label={t('LogsFilterFrom')}
                                    id='dateFrom'
                                    selected={dateFrom}
                                    lang={lang}
                                    handleChangeDate={this.handleChangeDateFrom}
                                />

                                <TimeFilter
                                    blockClass='logsTimeFilterToBl'
                                    label={t('LogsFilterTo')}
                                    id='dateTo'
                                    selected={dateTo}
                                    lang={lang}
                                    handleChangeDate={this.handleChangeDateTo}
                                    showNowBtn={true}
                                    handleNow={this.handleNow}
                                />

                            </div>

                            <LogsTable lang={lang} logsDataArr={logsDataArr} />

                            <div>{pagination}</div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect( (state: State) => ({ws: state.ws, localSettings: state.localSettings}) )(Logs);
