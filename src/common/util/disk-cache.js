/**********
 * 临时数据缓存
 * @type {{}}
 * @private
 */
let _cache_temp_data = {};
export default {
    set(key, score, data) {
        _cache_temp_data[key + '-' + score] = data;
    },
    get(key, score) {
        return _cache_temp_data[key + '-' + score];
    },
    clear(key, score) {
        if (key) {
            delete _cache_temp_data[key + '-' + score];
        } else {
            _cache_temp_data = {};
        }
    }
};