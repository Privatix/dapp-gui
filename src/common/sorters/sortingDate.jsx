"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DateSorter = {
    desc: function (data, key) {
        return data.sort(function (_a, _b) {
            var a = Date.parse(_a[key]);
            var b = Date.parse(_b[key]);
            if (a <= b) {
                return 1;
            }
            else if (a > b) {
                return -1;
            }
        });
    },
    asc: function (data, key) {
        return data.sort(function (_a, _b) {
            var a = Date.parse(_a[key]);
            var b = Date.parse(_b[key]);
            if (a >= b) {
                return 1;
            }
            else if (a < b) {
                return -1;
            }
        });
    }
};
exports.default = DateSorter;
