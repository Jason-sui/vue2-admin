"use strict";
const filter = {
    empty_val: '-',
    // filter方法
    formateTime(val, format = 'YYYY/MM/DD HH:mm') {
        return val ? dayjs(val).format(format) : this.empty_val;
    },
    formateStringNumberTime(val, format = 'YYYY/MM/DD HH:mm') {
        return +val ? dayjs(+val).format(format) : this.empty_val;
    },
    formateListLabel(val, list, value_key = 'value', label_key = 'label') {
        if (!list.length)
            return val;
        let item = list.find(i => i[value_key] === val);
        if (item)
            return item[label_key];
        return val;
    },
    formatObject(val) {
        return JSON.stringify(val || {}, null, 2);
    },
    getObjectKey(val, key) {
        try {
            return val[key];
        }
        catch (error) {
            return val;
        }
    }
};
