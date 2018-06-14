const OfferingsSorterById = {
    desc: (data, key) => {
        return data.sort((_a, _b) => {
            let a = _a[key].props.text;
            let b = _b[key].props.text;

            if ( a <= b ) {
                return 1;
            } else if ( a > b) {
                return -1;
            }
        });
    },

    asc: (data, key) => {
        return data.sort((_a, _b) => {
            let a = _a[key].props.text;
            let b = _b[key].props.text;

            if ( a >= b ) {
                return 1;
            } else if ( a < b) {
                return -1;
            }
        });
    }
};

export default OfferingsSorterById;
