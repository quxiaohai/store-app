/*********
 * 优化二维码
 * @param img
 * @param isCircle 是否圆形
 */
import { imageLoad } from 'common/util';

export default function(img, isCircle) {
    return new Promise(resolve => {
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 500;
        const ctx = canvas.getContext('2d');
        if (isCircle) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fill();
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = '#ffffff';
            ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2, false);
            ctx.fill();
            // 将上面的区域作为剪辑区域
            ctx.clip();
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const len = imageData.data.length / 4;
        for (let i = 0; i < len; i++) {
            const index = i * 4;
            const r = imageData.data[index];
            const g = imageData.data[index + 1];
            const b = imageData.data[index + 2];
            if (r > 250 && g > 250 && b > 250) {
                imageData.data[index + 3] = 0;
            }
        }
        ctx.putImageData(imageData, 0, 0);
        imageLoad(canvas.toDataURL('image/png', 1), img)
            .then(res => {
                resolve(res);
            });
    });
}
