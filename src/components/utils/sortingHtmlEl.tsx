function getInnerText(name: any) {
    console.log('Name', name.props.children);
    return name.props.children;
}

export const HtmlElSorter = {
    desc: (data, key) => {
        let res = data.sort((_a, _b) => {
            let a = getInnerText(_a[key]);
            let b = getInnerText(_b[key]);

            if (typeof a === 'undefined') {
                a = 0;
            }
            if (typeof b === 'undefined') {
                b = 0;
            }

            if ( a <= b ) {
                return 1;
            } else if ( a > b) {
                return -1;
            }
        });
        return res;
    },

    asc: (data, key) => {
        return data.sort((_a, _b) => {
            const a = getInnerText(_a[key]);
            const b = getInnerText(_b[key]);
            if ( a >= b ) {
                return 1;
            } else if ( a < b) {
                return -1;
            }
        });
    }
};
