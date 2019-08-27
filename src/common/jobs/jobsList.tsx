import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import Pagination from 'react-js-pagination';

import {State} from 'typings/state';
import { Job } from 'typings/jobs';

import StatusFilter from './blocks/statusFilter';
import JobsTable from './blocks/table';

interface IProps {
    t?: any;
    localSettings: State['localSettings'];
    ws: State['ws'];
}

interface IState {
    jobsData: Job[];
    activePage: number;
    pages: number;
    offset: number;
    limit: number;
    totalItems: number;
    statuses: string[];
}

@translate(['jobs/jobsList', 'common'])
class Jobs extends React.Component <IProps, IState> {

    constructor(props:IProps) {

        super(props);

        const { localSettings } = this.props;

        this.state = {
            jobsData: [],
            activePage: 1,
            pages: 1,
            offset: 0,
            limit: localSettings.paging.jobs,
            totalItems: 0,
            statuses: []
        };
    }

    componentDidMount() {
        const { statuses, offset, limit } = this.state;
        this.getJobsData(statuses, offset, limit);
    }

    async getJobsData(statuses:string[], offset: number, limit: number) {

        const { ws } = this.props;

        const jobs = await ws.getJobs(statuses, offset, limit);

        const pages = Math.ceil(jobs.totalItems / limit);
        this.setState({
            jobsData: jobs.items ? jobs.items : [],
            pages,
            totalItems: jobs.totalItems
        });

    }

    resetActivePage() {
        this.setState({activePage: 1});
    }

    handleChangeStatus = (evt:any) => {

        const evtStatus = evt.target.dataset.status;

        const { statuses, limit } = this.state;

        const modifiedStatuses = statuses.indexOf(evtStatus) === -1
              ? statuses.concat([evtStatus])
              : statuses.filter(status => status !== evtStatus);

        this.resetActivePage();

        this.setState({statuses: modifiedStatuses});
        this.getJobsData(modifiedStatuses, 0, limit);
    }

    handlePageChange = (activePage:number) => {

        const { statuses, limit } = this.state;

        this.getJobsData(statuses, (activePage-1)*limit, limit);

        this.setState({activePage});
    }

    render() {

        const { t } = this.props;
        const { totalItems
              , activePage
              , statuses
              , limit
              , jobsData
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
                        <h3 className='page-title'>{t('JobsHeader')}</h3>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-12'>
                        <div className='card-box'>
                            <table>
                                <tbody>
                                <tr>
                                    <td style={ {verticalAlign: 'top'}}>
                                        <i className='fa fa-info-circle'
                                           style={ {fontSize: '22px', color: 'deepskyblue', marginRight: '10px'} }>
                                        </i>
                                    </td>
                                    <td><p><i>{t('RestartJobInfo')}</i></p></td>
                                </tr>
                                </tbody>
                            </table>
                            <div className='row m-b-20'>

                                <StatusFilter statuses={statuses} handleChangeStatus={this.handleChangeStatus} />

                            </div>

                            <JobsTable jobs={jobsData} />

                            <div>{pagination}</div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect( (state: State) => ({ws: state.ws, localSettings: state.localSettings}) )(Jobs);
