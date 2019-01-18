"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
function ExportLogsBtns(props) {
    var t = props.t;
    return (<div>
            <button className='btn btn-default btn-custom waves-effect waves-light m-b-30' onClick={props.exportToFile}>{t('ExportBtn')}</button>
        </div>);
}
exports.default = ExportLogsBtns;
