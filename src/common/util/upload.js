import heic2any from 'heic2any';

/**
 * blob to base64
 * @param {*} blob 
 * @returns 
 */
function blobToBase64(blob) {
    try {
        return new Promise((resolve) => {
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                resolve(e?.target?.result || blob);
            };
            fileReader.readAsDataURL(blob);
            fileReader.onerror = () => {
                resolve(blob);
            };
        });
    } catch {
        resolve(blob);
    }
}

/**********
 * heic格式图片转为jpg
 * @param file
 */
export function heicToJpg(file) {
    const filename = file.name;
    return new Promise((resolve) => {
        try {
            const reader = new FileReader();
            reader.onload = function () {
                heic2any({ blob: file, toType: 'image/jpeg' })
                    .then(async (blob) => {
                        const newFile = new File([blob], `${filename}.jpg`, { type: 'image/jpeg' });
                        const base64 = await blobToBase64(blob);
                        resolve({
                            file: newFile,
                            base64: base64
                        });
                    })
                    .catch((err) => {
                        console.log('heic2any err', err);
                        resolve({ file });
                    });
                return;
            };
            reader.readAsArrayBuffer(file);
        } catch (e) {
            console.log('heic2any e', e);
            resolve({ file });
        }
    });
}