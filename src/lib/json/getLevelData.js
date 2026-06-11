import { isObject } from 'lib/util/dataType';

/***************
 * 获取平层数据
 * 例：
 * import getLevelData from 'lib/json/getLevelData'
 * let obj = {a: {b: {c: {d: [2, 3], e: 2}}}}
 * getLevelData(obj) = {'a.b.c.d': [2, 3], 'a.b.c.e': 2};
 * @param data
 */

export default function(data) {

    const result = {};

    const formatFilterName = (name, val) => {
        if (isObject(val)) {
            Object.keys(val).forEach(key => {
                formatFilterName(`${name}.${key}`, val[key]);
            });
        } else {
            result[name] = val;
        }
    };

    if (isObject(data)) {
        Object.keys(data).forEach(key => {
            formatFilterName(key, data[key]);
        });

        return result;
    }

    return data;
}