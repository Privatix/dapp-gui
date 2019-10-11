import * as React from 'react';
import { connect } from 'react-redux';
import { WithTranslation, withTranslation } from 'react-i18next';
import Pagination from 'react-js-pagination';

import moment from 'moment';

import { remote } from 'electron';
const {dialog} = remote;

import * as api from 'utils/api';
import notice from 'utils/notice';

import {State} from 'typings/state';
import { Log } from 'typings/logs';

import ExportBtns from './blocks/exportBtns';
import Search from './blocks/search';
import LevelsFilter from './blocks/levelsFilter';
import TimeFilter from './blocks/timeFilter';
import LogsTable from './blocks/table';

interface IProps extends WithTranslation {
    localSettings: State['localSettings'];
    ws: State['ws'];
}

interface IState {
    logsData: Log[];
    dateFrom: any;
    dateTo: any;
    searchText: string;
    activePage: number;
    pages: number;
    offset: number;
    limit: number;
    totalItems: number;
    levels: string[];
    lang: string;
}

class Logs extends React.Component <IProps, IState> {

    constructor(props:IProps) {

        super(props);

        const { localSettings } = this.props;

        this.state = {
            logsData: [],
            dateFrom: moment().subtract(1, 'day').toDate(),
            dateTo: new Date(),
            searchText: '',
            activePage: 1,
            pages: 1,
            offset: 0,
            limit: localSettings.paging.logs,
            totalItems: 0,
            levels: [],
            lang: localSettings.lang
        };
    }

    componentDidMount() {
        const { levels, searchText, dateFrom, dateTo, offset, limit } = this.state;
        this.getLogsData(levels, searchText, dateFrom, dateTo, offset, limit);
    }

    async getLogsData(levels:string[], searchText: string, dateFrom:any, dateTo:any, offset: number, limit: number) {

        const { ws } = this.props;

        const isoDateFrom = new Date(dateFrom).toISOString();
        const isoDateTo = new Date(dateTo).toISOString();

        const logs = await ws.getLogs(levels, searchText, isoDateFrom, isoDateTo, offset, limit);

        const pages = Math.ceil(logs.totalItems / limit);
        this.setState({
            logsData: logs.items ? logs.items : [],
            pages,
            totalItems: logs.totalItems
        });

    }

    getLogsDataExport() {

        const { logsData } = this.state;

        return logsData === null
            ? []
            : logsData.map(log => (
                [
                    log.time,
                    log.level,
                    '"' + log.message.replace(/"/g, '\"\"') + '"',
                    '"' + JSON.stringify(log.context).replace(/"/g, '\"\"') + '"',
                    log.stack !== null ? '"' + log.stack.replace(/"/g, '\"\"') + '"' : ''
                ]
            ));
    }

    resetActivePage() {
        this.setState({activePage: 1});
    }

    handleChangeLevel = (evt:any) => {

        const evtLevel = evt.target.dataset.level;

        const { levels, searchText, dateFrom, dateTo, limit } = this.state;

        const modifiedLevels = levels.indexOf(evtLevel) === -1
              ? levels.concat([evtLevel])
              : levels.filter(level => level !== evtLevel);

        this.resetActivePage();

        this.setState({levels: modifiedLevels});
        this.getLogsData(modifiedLevels, searchText, dateFrom, dateTo, 0, limit);
    }

    handleChangeDateFrom = (dateFrom: any) => {

        const { levels, searchText, dateTo, limit } = this.state;

        this.resetActivePage();
        this.alertOnBigDateRangeSelect(dateFrom, dateTo);

        this.getLogsData(levels, searchText, dateFrom, dateTo, 0, limit);

        this.setState({dateFrom});
    }

    handleChangeDateTo = (dateTo: any) => {

        const { levels, searchText, dateFrom, limit } = this.state;

        this.resetActivePage();
        this.alertOnBigDateRangeSelect(dateFrom, dateTo);

        this.getLogsData(levels, searchText, dateFrom, dateTo, 0, limit);

        this.setState({dateTo});
    }

    handleNow = () => {
        this.handleChangeDateTo(new Date());
    }

    handlePageChange = (activePage:number) => {

        const { levels, searchText, dateTo, dateFrom, limit } = this.state;

        this.getLogsData(levels, searchText, dateFrom, dateTo, (activePage-1)*limit, limit);

        this.setState({activePage});
    }

    handleSearch = (evt:any) => {

        const { levels, dateFrom, dateTo, limit } = this.state;

        const searchText = evt.target.value;

        if (evt.key === 'Enter') {
            this.getLogsData(levels, searchText, dateFrom, dateTo, 0, limit);
            this.resetActivePage();
            this.setState({searchText});
        }
    }

    handleChangeSearch = (evt:any) => {
        this.setState({searchText: evt.target.value});
    }

    handleClearSearch = () => {

        const { levels, dateFrom, dateTo, limit } = this.state;

        this.resetActivePage();
        this.setState({searchText: ''});
        this.getLogsData(levels, '', dateFrom, dateTo, 0, limit);
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
              , activePage
              , searchText
              , levels
              , dateFrom
              , dateTo
              , lang
              , limit
              , logsData
              } = this.state;

        const pagination = totalItems <= limit
            ? null
            : <Pagination
                activePage={activePage}
                itemsCountPerPage={limit}
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

                            <LogsTable lang={lang} logs={logsData} />

                            <div>{pagination}</div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect( (state: State) => ({ws: state.ws, localSettings: state.localSettings}) )(withTranslation(['logs/logsList', 'common'])(Logs));
