/******
 *生成随机数
 *
 ******/

let _uniqueID = 20200611;

export const getZIndex = () => _uniqueID++;
export const getUniqueId = () => ("COMP_UNIQUE_" + _uniqueID++);
export const getRandom = len => {
  // 创建 随机{len}位数字字母字符串, 默认16位
  let result = "";
  let range = len || 16;
  let arrData = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  for(let i = 0; i < range; i++){
    let pos = Math.round(Math.random() * (arrData.length-1));
    result += arrData[pos];
  }

  return result;
};

export const uid = () => {
  return getRandom(8) + Date.now().toString().substr(4);
};