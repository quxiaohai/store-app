/***
 * 返回字的长度
 * @param str
 * @returns {number}
 */

export default function(str) {
    return (str || "").replace(/[^\x00-\xff]/g, "aa").length;
}