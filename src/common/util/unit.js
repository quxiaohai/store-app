/*****
 * 单位转换
 * @param val
 * @param unit
 * @param def
 * @returns {*}
 */
export default function (val, unit, def) {
    def = def || 10000;
    if (val < def) {
        return val;
    }

    const r = parseFloat((val / def).toFixed(1));

    return r > 10000 ? '9999' + unit + '+' : r + unit;
}