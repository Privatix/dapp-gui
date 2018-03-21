import * as $ from 'jquery';
import 'free-jqgrid';
import {ipcRenderer} from 'electron';
import {fetchFactory} from './fetch';
import TemplatesList from './components/templatesList';

// tslint:disable-next-line
import * as React from 'react';
// tslint:disable-next-line
import {Component} from 'react';
import { render } from 'react-dom';

// import Form from 'react-jsonschema-form';


const fetch = fetchFactory(ipcRenderer);

fetch('/sessions', {}).then(res => {
    $(document).ready(function () {
        'use strict';
        const data = {
            'page': '1',
            'records': '3',
            'rows': res
        };
        const grid = $('#sessions_list');

        grid.jqGrid({
            colModel: [
                { name: 'id', index: 'id', width: '100' },
                { name: 'state_channel_id', index: 'state_channel_id', width: '100' },
                { name: 'started', index: 'started', width: '100' },
                { name: 'stopped', index: 'stopped', width: '100' },
                { name: 'up', index: 'up', width: '100' },
                { name: 'down', index: 'down', width: '100' },
            ],
            pager: '#packagePager',
            datatype: 'jsonstring',
            datastr: data,
            jsonReader: { repeatitems: false },
            rowNum: 2,
            viewrecords: true,
            caption: 'Sessions',
            height: 'auto',
            ignoreCase: true
        });
        grid.jqGrid('navGrid', '#pager',
            { add: false, edit: false, del: false }, {}, {}, {},
            { multipleSearch: true, multipleGroup: true });
        grid.jqGrid('filterToolbar', { defaultSearch: 'cn', stringResult: true });
    });
});

fetch('/getSOTemplates', {}).then(res => {
    render(<TemplatesList list={res} />, document.getElementById('templatesList'));
});
