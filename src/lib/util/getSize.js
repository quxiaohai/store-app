/********
 * 获取元素的宽高
 * @param element
 * @returns {{width: number, height: number}}
 * 穆辰：20200701
 */
import getStyle from './getStyle';

export default function(element) {
    const node = element.cloneNode(true);

    node.style.cssText = `position: fixed; top: -100000px; visibility: hidden;`;
    document.body.appendChild(node);

    node.childNodes.forEach(dom => {
        if (dom.nodeType === 1) {
            const display = getStyle(dom, 'display');
            // 防止块无法计算宽度
            if (display === 'block') {
                dom.style.display = 'inline-block';
            }
            dom.style.position = 'relative';
        }
    });

    const width = node.offsetWidth;
    const height = node.offsetHeight;

    document.body.removeChild(node);

    return { width: width, height: height, screenWidth: window.innerWidth, screenHeight: window.top !== window.self ? window.screen.availHeight : window.innerHeight };
};
