/**
 * 千分位转化
 *
 * 例子：
 *  import thousands form "lib/util/thousands";
 *  thousands("10000000"); //10,000,000
 *
 */

export default function(num) {
    num = num + "";
    if (num === "") {
        return num;
    }
    if (isNaN(num)) {
        return num;
    }
    var index = num.indexOf(".");
    var reg = /(-?\d+)(\d{3})/;
    if (index === -1) {
        while (reg.test(num)) {
            num = num.replace(reg, "$1,$2");
        }
    } else {
        var intPart = num.substring(0, index);
        var pointPart = num.substring(index + 1, num.length);
        while (reg.test(intPart)) {
            intPart = intPart.replace(reg, "$1,$2");
        }
        num = intPart +"."+ pointPart;
    }
    return num;
};
