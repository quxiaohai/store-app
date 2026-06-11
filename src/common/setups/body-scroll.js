import { onMounted, onUnmounted, onActivated, onDeactivated } from 'vue';

/***********
 * 设置body滚动
 */
export default function bodyScroll() {
    onMounted(() => {
        document.body.classList.add('body-hidden');
    });
    onActivated(() => {
        document.body.classList.add('body-hidden');
    });
    onUnmounted(() => {
        document.body.classList.remove('body-hidden');
    });
    onDeactivated(() => {
        document.body.classList.remove('body-hidden');
    });

    return {};
}