"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var HintComponent = /** @class */ (function (_super) {
    __extends(HintComponent, _super);
    function HintComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HintComponent.prototype.render = function () {
        var text = this.props.text;
        return (<table>
                <tbody>
                <tr>
                    <td style={{ verticalAlign: 'top', width: '30' }}>
                        <i className='fa fa-info-circle' style={{ fontSize: '22px', color: 'deepskyblue', marginRight: '10px' }}></i>
                    </td>
                    <td>
                        {{ text: text }}
                    </td>
                </tr>
                </tbody>
            </table>);
    };
    return HintComponent;
}(React.Component));
exports.default = HintComponent;
