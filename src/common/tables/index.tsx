import * as React from 'react';
import i18n from 'i18next/init';

import CopyToClipboard from 'common/copyToClipboard';

import ModalPropTextSorter from 'common/sorters/sortingModalByPropText';
import DateSorter from 'common/sorters/sortingDate';

import ContractStatusComponent from 'common/badges/contractStatus';
import ChannelStatus from 'common/badges/channelStatus';
import JobName from 'common/badges/jobName';
import JobStatusComponent from 'common/badges/jobStatus';
import UsageComponent from 'common/badges/channelUsage';
import OfferingStatusComponent from 'common/badges/offeringStatus';
import AvailabilityComponent from 'common/badges/availability';
import PgTime from 'common/etc/pgTime';
import LogsTime from 'common/etc/logsTime';

export const Client = {
    header: i18n.t('tables:Client'),
    key: 'client',
    dataProps: { className: 'shortTableTextTd' },
    render: (client) => {
        const clientText = '0x' + client;
        return <div>
            <span className='shortTableText' title={clientText}>{clientText}</span>
            <CopyToClipboard text={clientText} />
        </div>;
    }
};

export const ClientIP = {
    header: i18n.t('tables:ClientIP'),
    key: 'clientIP',
    headerStyle: {textAlign: 'center'},
    dataProps: {className: 'text-center shortTableTextTd'},
    sortable: false
};

export const Agent = {
    header: i18n.t('tables:Agent'),
    key: 'agent',
    headerStyle: {textAlign: 'center'},
    dataProps: {className: 'text-center shortTableTextTd'},
    render: (agent) => {
        return <div>
            <span className='shortTableText' title={agent}>{agent}</span>
            <CopyToClipboard text={agent} />
        </div>;
    }
};

export const Id = {
    header: i18n.t('tables:Id'),
    key: 'id',
    headerStyle: {textAlign: 'center'},
    dataProps: {className: 'text-center shortTableTextTd'},
    descSortFunction: ModalPropTextSorter.desc,
    ascSortFunction: ModalPropTextSorter.asc
};
export const CopyableId = {
    header: i18n.t('tables:Id'),
    key: 'id',
    sortable: false,
    dataProps: { className: 'shortTableTextTd' },
    render: id => (
        <div>
            <span className='shortTableText' title={id}>{id}</span>
            <CopyToClipboard text={id} />
        </div>
    )
};

export const Offering = {
    header: i18n.t('tables:Offering'),
    key: 'offering',
    dataProps: { className: 'shortTableTextTd' },
    descSortFunction: ModalPropTextSorter.desc,
    ascSortFunction: ModalPropTextSorter.asc
};

export const OfferingStatus = {
    header: i18n.t('tables:Status'),
    key: 'offerStatus',
    headerStyle: {textAlign: 'center'},
    dataProps: {className: 'text-center'},
    render: (offerStatus) => { return <OfferingStatusComponent status={offerStatus} />; }
};

export const ContractStatus = {
    header: i18n.t('tables:ContractStatus'),
    key: 'contractStatus',
    headerStyle: {textAlign: 'center'},
    dataProps: {className: 'text-center'},
    render: status => <ContractStatusComponent contractStatus={status}/>
};

export const ServiceStatus = {
    header: i18n.t('tables:ServiceStatus'),
    key: 'serviceStatus',
    headerStyle: {textAlign: 'center'},
    dataProps: {className: 'text-center'},
    render: status => <ChannelStatus serviceStatus={status}/>
};

export const JobStatus = {
    header: i18n.t('tables:JobStatus'),
    key: 'jobStatus',
    sortable: false,
    render: (job) => {
        const jobTimeRaw = new Date(Date.parse(job.createdAt));
        const jobTime = jobTimeRaw.getHours() + ':' + (jobTimeRaw.getMinutes() < 10 ? '0' : '') + jobTimeRaw.getMinutes();
        return <div className='noWrap'><JobName jobtype={job.type} /><br /> (<JobStatusComponent status={job.status} /> {jobTime})</div>;
    }
};

export const PlainUsage = {
    header: i18n.t('tables:Usage'),
    key: 'usage',
    headerStyle: {textAlign: 'center'},
    dataProps: { className: 'text-center'},
    sortable: false
};

export const Usage = {
    header: i18n.t('tables:Usage'),
    key: 'usage',
    headerStyle: {textAlign: 'center'},
    dataProps: { className: 'text-center'},
    render: (usage) => { return <UsageComponent usage={usage} mode='unit' />; }
};

export const CostPRIX = {
    header: i18n.t('tables:CostPRIX'),
    key: 'costPRIX',
    render: usage => <UsageComponent usage={usage} mode='prix' />
};

export const IncomePRIX = {
    header: i18n.t('tables:IncomePRIX'),
    key: 'costPRIX',
    headerStyle: {textAlign: 'center'},
    dataProps: { className: 'text-center'},
    render: usage => <UsageComponent usage={usage} mode='prix' />
};

export const Availability = {
    header: i18n.t('tables:Availability'),
    key: 'availability',
    headerStyle: {textAlign: 'center'},
    dataProps: {className: 'text-center'},
    render: availability => <AvailabilityComponent availability={availability} />
};

export const Hash = {
    header: i18n.t('tables:Hash'),
    key: 'hash',
    headerStyle: {textAlign: 'center'},
    dataProps: { className: 'text-center shortTableTextTd'},
    descSortFunction: ModalPropTextSorter.desc,
    ascSortFunction: ModalPropTextSorter.asc
};

export const Block = {
    header: i18n.t('tables:Block'),
    key: 'block'
};

export const Country = {
    header: i18n.t('tables:Country'),
    key: 'country'
};

export const Price = {
    header: i18n.t('tables:Price'),
    key: 'price'
};

export const AvailableSupply = {
    header: i18n.t('tables:AvailableSupply'),
    key: 'availableSupply',
    headerStyle: {textAlign: 'center'},
    dataProps: { className: 'text-center'}
};

export const Supply = {
    header: i18n.t('tables:Supply'),
    key: 'supply',
    headerStyle: {textAlign: 'center'},
    dataProps: { className: 'text-center'}
};

export const ServiceName = {
    header: i18n.t('tables:ServiceName'),
    key: 'serviceName'
};

export const Server = {
    header: i18n.t('tables:Server'),
    key: 'server',
    descSortFunction: ModalPropTextSorter.desc,
    ascSortFunction: ModalPropTextSorter.asc
};

export const ServiceLastChanged = {
    header: i18n.t('tables:ServiceChangedTime'),
    key: 'serviceChangedTime',
    descSortFunction: DateSorter.desc,
    ascSortFunction: DateSorter.asc,
    render: serviceChangedTime => <PgTime time={serviceChangedTime} />
};

export const LastUsed = {
    header: i18n.t('tables:LastUsedTime'),
    key: 'lastUsedTime',
    descSortFunction: DateSorter.desc,
    ascSortFunction: DateSorter.asc,
    render: lastUsedTime => <PgTime time={lastUsedTime} />
};

export const Started = {
    header: i18n.t('tables:Started'),
    key: 'started',
    sortable: false,
    render: started => <PgTime time={started} />
};

export const Stopped = {
    header: i18n.t('tables:Stopped'),
    key: 'stopped',
    sortable: false,
    render: stopped => <PgTime time={stopped} />
};

export const DateCol = {
    header: i18n.t('tables:Date'),
    key: 'date',
    defaultSorting: 'DESC',
    descSortFunction: DateSorter.desc,
    ascSortFunction: DateSorter.asc
};

export const EthereumLink = {
    header: i18n.t('tables:EthereumLink'),
    key: 'ethereumLink',
    sortable: false
};

export const Level = {
    header: i18n.t('tables:Level'),
    key: 'level',
    render: level => {
        const labelClasses = {
            debug: 'primary',
            info: 'success',
            warning: 'warning',
            error: 'pink',
            fatal: 'danger'
        };
        return <span className={`label label-table label-${labelClasses[level]}`}>{level}</span>;
    }
};

export const LogsDate = {
    header: i18n.t('tables:Date'),
    key: 'date',
    dataProps: {className: 'minWidth160'},
    descSortFunction: DateSorter.desc,
    ascSortFunction: DateSorter.asc,
    render: ([date, lang]) => <LogsTime time={date} lang={lang} />
};

export const Message = {
    header: i18n.t('tables:Message'),
    key: 'message',
    sortable: false
};

export const Context = {
    header: i18n.t('tables:Context'),
    key: 'context',
    sortable: false
};

export const Stack = {
    header: i18n.t('tables:Stack'),
    key: 'stack',
    sortable: false
};

// Accounts

export const Name = {
    header: i18n.t('tables:Name'),
    key: 'name'
};

export const EthereumAddress = {
    header: i18n.t('tables:EthereumAddress'),
    key: 'ethereumAddress',
    dataProps: { className: 'shortTableTextTd' },
    render: ethereumAddress => (
        <div>
            <span className='shortTableText' title={ethereumAddress}>{ethereumAddress}</span>
            <CopyToClipboard text={ethereumAddress} />
        </div>
    )
};

export const ETH = {
    header: i18n.t('tables:ETH'),
    key: 'eth'
};

export const ExchangeBalance = {
    header: i18n.t('tables:ExchangeBalance'),
    key: 'exchangeBalance',
    headerStyle: {textAlign: 'center'},
    dataProps: {className: 'text-center'},
};

export const ServiceBalance = {
    header: i18n.t('tables:ServiceBalance'),
    key: 'serviceBalance',
    headerStyle: {textAlign: 'center'},
    dataProps: { className: 'text-center'},
};

export const IsDefault = {
    header: i18n.t('tables:IsDefault'),
    key: 'isDefault',
    headerStyle: {textAlign: 'center'},
    dataProps: { className: 'text-center'},
    sortable: false
};

export const Actions = {
    header: i18n.t('tables:Actions'),
    key: 'actions',
    headerStyle: {textAlign: 'center'},
    dataProps: { className: 'text-center'},
    sortable: false
};
