"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var moment = require("moment");
function default_1(props) {
    if (props.time) {
        moment.locale(props.lang);
        var date = new Date(Date.parse(props.time));
        var formattedDate = moment(date).format('h:mm A DD-MMM-YY');
        return <span>{formattedDate}</span>;
    }
    else {
        return <span></span>;
    }
}
exports.default = default_1;
