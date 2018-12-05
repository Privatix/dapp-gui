const DateSorter = {
    desc: (data, key) => {
        return data.sort((_a, _b) => {
            let a = Date.parse(_a[key].props.time);
            let b = Date.parse(_b[key].props.time);

            if ( a <= b ) {
                return 1;
            } else if ( a > b) {
                return -1;
            }
        });
    },

    asc: (data, key) => {
        return data.sort((_a, _b) => {
            let a = Date.parse(_a[key].props.time);
            let b = Date.parse(_b[key].props.time);

            if ( a >= b ) {
                return 1;
            } else if ( a < b) {
                return -1;
            }
        });
    }
};

export default DateSorter;
