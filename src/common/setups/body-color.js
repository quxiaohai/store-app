import { onMounted, onUnmounted } from 'vue';

/***********
 * 设置body背景颜色
 * @param clsName
 */
export default function bodyColor(clsName) {
    onMounted(() => {
        document.body.classList.add(clsName);
    });
    onUnmounted(() => {
        document.body.classList.remove(clsName);
    });
}