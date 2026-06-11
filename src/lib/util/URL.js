/**
 * URL的解析和合成，注意：该设计有缺陷，不支持username:userpass，不过一般都用不上
 *
 * import URL from "../util/URL";
 * var urlObj = URL.parse("http://www.baidu.com:8080/index.html?p=1#link1");
 * 得到：
 * {
 *     hash: "link1",
 *     host: "www.baidu.com",
 *     path: "/index.html",
 *     port: "8080",
 *     query: "p=1",
 *     scheme: "http:",
 *     slash: "//",
 *     url: "http://www.baidu.com:8080/index.html?p=1#link1"
 * }
 */
import query from '../json/query'

export default {
    parse (url = location.herf) {
        let link = document.createElement("A");
        link.href = url;
        let queryStr = link.search.substr(1);
        let hash = link.hash.substr(1);

        return {
            "url": url,
            "scheme": link.protocol,
            "host": link.host,
            "port": link.port,
            "path": link.pathname,
            "query": queryStr,
            hash,
            "queryJson": query.parse(queryStr),
            "hashJson": query.parse(hash)
        }
    },
    build: function(url) {
        return url.scheme + "//" + url.host + (url.port != "" ? ":" + url.port : "") + url.path + (url.query != "" ? "?" + url.query : "") + (url.hash != "" ? "#" + url.hash : "");
    },
    // 向url更新参数：添加，删除；添加相同参数则为更新
    updateQueryStringParameter: function (url, key, value, type = 'add') { // type : add / remove
        if (!value && type == 'add') {
            return url
        }
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i")
        var separator = url.indexOf('?') !== -1 ? "&" : "?"
        if (url.match(re)) {
            return type == 'add' ? url.replace(re, '$1' + key + "=" + value + '$2') : url.replace(re, '$1' + '$2')
        } else {
            return url + separator + key + "=" + value
        }
    }
}