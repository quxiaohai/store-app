import {isNumber } from "lib/util/dataType";

const ani = {
    format (total, value, def){
        if(!isNaN(parseInt(value))){
            if(/%$/.test(value)) {
                return Math.round(total * parseFloat(value) / 100);
            }else{
                return parseInt(value);
            }
        }
        return def || value;
    },
    left(size, left, top, right, bottom, turn) {
        left = ani.format(size.screenWidth, left);
        if (!isNumber(left)) {
            right = ani.format(size.screenWidth, right);
            left = isNumber(right) ? size.screenWidth - size.width - right : 0;
        }
        const fh = turn ? '' : '-';
        const pos = turn ? 'right' : 'left';
        return `.m-popup.${pos}-enter-from,.m-popup.${pos}-leave-to {transform: translateX(${fh}${left + size.width + 20}px) !important;}`;
    },
    top(size, left, top, right, bottom, turn) {
        top = ani.format(size.screenHeight, top);
        if (!isNumber(top)) {
            bottom = ani.format(size.screenWidth, bottom);
            top = isNumber(bottom) ? size.screenHeight - size.height - bottom : 0;
        }
        const fh = turn ? '' : '-';
        const pos = turn ? 'bottom' : 'top';
        return `.m-popup.${pos}-enter-from,.m-popup.${pos}-leave-to {transform: translateY(${fh}${top + size.height + 20}px) !important;}`;
    },
    right(size, left, top, right, bottom) {
        return ani.left(size, right, top, left, bottom,true);
    },
    bottom(size, left, top, right, bottom) {
        return ani.top(size, left, bottom, right, top, true);
    }
};

export default ani;
