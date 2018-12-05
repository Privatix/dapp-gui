const DateSorter = {
    desc: (data, key) => {
        return data.sort((_a, _b) => {
            let a = Date.parse(_a[key]);
            let b = Date.parse(_b[key]);

            if ( a <= b ) {
                return 1;
            } else if ( a > b) {
                return -1;
            }
        });
    },

    asc: (data, key) => {
        return data.sort((_a, _b) => {
            let a = Date.parse(_a[key]);
            let b = Date.parse(_b[key]);

            if ( a >= b ) {
                return 1;
            } else if ( a < b) {
                return -1;
            }
        });
    }
};

export default DateSorter;
