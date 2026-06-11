/**
 * 处理节点在可视区域
 * @param {*} el  element id
 * @param {*} visibleCallback 在可视范围内的回调
 * @returns
 */
const isElementVisible = (el, visibleCallback) => {
    const vWidth = window.innerWidth || document.documentElement.clientWidth
    const vHeight = window.innerHeight || document.documentElement.clientHeight
    const node = document.getElementById(el)
    const rect = node?.getBoundingClientRect()

    if (
        !rect ||
        rect.right < 0 ||
        rect.bottom < 0 ||
        rect.left > vWidth ||
        rect.top > vHeight
    ) {
        // 非可视
    } else {
        // 可视范围内
        visibleCallback && visibleCallback()
    }
}

export default isElementVisible
