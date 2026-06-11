import { isString } from 'lib/util/dataType';
import { getJSON } from 'common/util';

/***********
 * 返回规格
 */
export const specListToText = function(list, id) {
    const obj = list.find(r => r.id === id);
    return obj?.size || obj?.skuSpecList?.map(c => `${c.specValue}`).join('; ') || '';
};

export const specToText = function(obj) {
    return obj?.size || obj.skuSpecList?.map(c => `${c.specValue}`).join('; ') || '';
};

export const specMapToText = function(text) {
    try {
        return Object.values(JSON.parse(text)).join('; ');
    } catch (e) {
        return '';
    }
};

/// 获取产品规格显示信息
export const formatSpecValueMap = function(spec) {
    try {
        if (isString(spec)) {
            // {"尺寸":"大群","颜色":"红","test":"12"}
            // 尺寸-大群,颜色-红,test-12
            const specMap = getJSON(spec, {});
            const nameKeys = Object.keys(specMap);
            const specKeys = nameKeys.map(name => specMap[name]);
            specKeys.sort((a, b) => {
                const ak = spec.indexOf(`:"${a}"`);
                const bk = spec.indexOf(`:"${b}"`);
                return ak - bk > 0 ? 1 : -1;
            });
            return specKeys.join('; ');
        } else {
            return '';
        }
    } catch (e) {
        return spec;
    }
};
