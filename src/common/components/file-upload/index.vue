<template>
    <div class="file-upload" :class="`cols-${cols}`">
        <template v-for="item in fileList" :key="item.id">
            <upload
                :option="item"
                @del="handleDelete(item)"
                @finish="handleUploadFinish($event, item)"/>
        </template>
        <div v-if="showAddButton" class="upload-box add">
            <div class="add-box flex-center-col">
                <i class="iconfont icon-add"></i>
                <span class="text">
                    {{ text }}
                </span>
                <span class="text" v-if="desc">{{ desc }}</span>
                <span v-else-if="multiple && limit > 1 && modelValue" class="text">
                    ({{ modelValue.length }}/{{ limit }})
                </span>
            </div>
            <input
                class="file-box"
                type="file"
                ref="input"
                :name="name"
                @change="handleChange"
                :multiple="multiple && allowMultiple"
                accept="image/*,video/*"
            />
        </div>
    </div>
</template>
<script>
import { getMediaType } from 'common/util';
import { isFunction } from 'lib/util/dataType';
import upload from './upload';
import bridge from 'common/util/bridge';
import base64 from 'lib/str/base64';
import { DEFAULT_VIDEO_COVER } from 'common/util/constant';
import { isLock, unLock, lock } from 'lib/util/lock';

export default {
    name: 'file-upload',
    props: {
        // 默认排3列
        cols: {
            type: Number,
            default: 3
        },
        /// 绑定的值
        modelValue: {
            type: [String, Array]
        },
        /// 是否是私有桶
        isPrivate: {
            type: Boolean,
            default: false
        },
        /// 预览图初始化map
        privateMap: {
            type: Object
        },
        /// 是否可多选
        multiple: {
            type: Boolean,
            default: false
        },
        /// 上传的文本
        text: String,
        desc: String,
        /// name
        name: {
            type: String,
            default: 'file'
        },
        /// 类型
        type: {
            type: String,
            default: 'img',
            validator(type) {
                let typeList = ['both', 'video', 'img'];
                return typeList.indexOf(type) > -1;
            }
        },
        /// 限制条件
        limit: {
            type: Number,
            default: 1
        },
        /// 额外的参数
        formData: Object
    },
    emits: ['update:modelValue', 'uploadChange'],
    data() {
        return {
            fileList: [],
            /// 私有桶预览图缓存
            privatePreviewMap: { ...this.privateMap },
            /// 上传集合
            uploadMap: {},
            // 预览集合
            previewList: [],
            allowMultiple: true,
            isApp: false
        };
    },
    components: {
        upload
    },
    watch: {
        modelValue() {
            this.changeFileList();
        }
    },
    mounted() {
        this.changeFileList();
        this.initDeviceType();
    },
    computed: {
        /// 是否显示添加按钮
        showAddButton() {
            return this.multiple ? (this.modelValue?.length || 0) < this.limit : !this.modelValue;
        }
    },
    methods: {
        // 初始化手机类型
        initDeviceType() {
            const ua = navigator.userAgent.toLocaleLowerCase();
            this.allowMultiple = !((bridge.isWeApp() || ua.match(/micromessenger/gi)) && ua.match(/android/gi));
            bridge.minVersion('2.4.00')
                .then(bool => {
                    console.log('version', bool);
                    this.isApp = bool;
                });
        },
        // 更新fileList
        changeFileList() {
            if (!this.modelValue) {
                return false;
            }

            [].concat(this.modelValue).forEach(url => {
                if (!this.uploadMap[url] && url) {
                    this.fileList.push({
                        path: this.privatePreviewMap[url] || url,
                        id: Date.now() + Math.round(Math.random() * 10000),
                        key: url,
                        state: 2
                    });

                    this.uploadMap[url] = true;
                }
            });
        },
        /// app 上传
        handleAppUpload() {
            if (!this.isApp || isLock('upload')) {
                return false;
            }

            lock('upload');
            const timer = setTimeout(() => {
                unLock('upload');
                console.log('释放了upload');
            }, 1200);
            bridge.getAppPhoto({
                private: this.isPrivate ? 2 : 1,
                type: this.type === 'both' ? 3 : this.type === 'video' ? 2 : 1
            })
                .then(res => {
                    const isVideo = getMediaType(res?.url);
                    let key = this.isPrivate ? res?.objectKey : res?.url;
                    let thumb = isVideo ? '&thumbnailUrl=' + base64.encode(DEFAULT_VIDEO_COVER) : '';
                    if (thumb) {
                        key = key + (key?.includes('?') ? '&' : '?') + thumb;
                    }

                    const url = thumb ? res?.url + (res?.url?.includes('?') ? '&' : '?') + thumb : res?.url;

                    const obj = {
                        state: 2,
                        path: url,
                        id: Date.now() + Math.round(Math.random() * 10000)
                    };
                    this.fileList.push(obj);
                    this.handleUploadFinish({
                        type: 'suc',
                        data: { url, key }
                    }, obj);
                })
                .catch(err => {
                    if (Number(err.result) === 888) {
                        console.log('上传已取消~');
                        return false;
                    } else if (Number(err.result) === 999) {
                        return this.$layer.toast('网络异常，请重试~');
                    }
                    this.$layer.toast(err.msg || '上传失败~');
                })
                .finally(() => {
                    clearTimeout(timer);
                    unLock('upload');
                    console.log('释放了upload');
                });
        },
        /// h5的添加操作
        handleChange(ev) {

            const files = ev?.target?.files;

            if (!files) {
                return false;
            }

            let postFiles = Array.prototype.slice.call(files);

            if (this.multiple && this.modelValue?.length + postFiles.length > this.limit) {
                return this.$layer.toast('文件数量不能超过限制');
            }
            postFiles.forEach(rawFile => {
                this.checkFile(rawFile, (file, uploadUrl) => {
                    this.fileList.push({
                        file,
                        uploadUrl,
                        extraData: this.formData,
                        isPrivate: this.isPrivate,
                        id: Date.now() + Math.round(Math.random() * 10000)
                    });
                });
            });
            this.$emit('uploadChange', this.fileList.length, this.uploadMap, this.privatePreviewMap);
        },
        /// 检查文件
        checkFile(file, callback) {
            const fileType = file.type || '';
            const isImg = fileType.indexOf('image') > -1;
            const isVideo = fileType.indexOf('video') > -1;
            let resultType = true;
            let resultSize = true;
            let message = '';
            let url = isImg ? this.$api.uploadImage : this.$api.fileUpload;
            if (this.isPrivate) {
                url = this.$api.uploadFileToPrivate;
            }
            if (isImg && file.size > this.fileMToBite(5)) {
                resultSize = false;
                message = '图片大小不能超过5M';
            }
            if (isVideo && file.size > this.fileMToBite(20)) {
                resultSize = false;
                message = '视频大小不能超过20M';
            }
            if (this.type === 'img' && !isImg) {
                resultType = false;
                message = '请上传图片类型文件';
            }
            if (this.type === 'video' && !isVideo) {
                resultType = false;
                message = '请上传视频类型文件';
            }
            if (resultType && resultSize) {
                if (isFunction(callback)) {
                    callback(file, url);
                }
            } else {
                this.$layer.toast(message);
            }
        },
        /// 将兆改为字节数量
        fileMToBite(size) {
            return size * 1024 * 1024;
        },
        // 删除
        handleDelete(obj) {
            this.fileList = this.fileList.filter(f => f.id !== obj.id);
            delete this.privatePreviewMap[obj.key];
            delete this.uploadMap[obj.key];
            if (this.multiple) {
                this.$emit('update:modelValue', this.modelValue.filter(r => r !== obj.key));
            } else {
                this.$emit('update:modelValue', null);
            }
        },
        // 上传完成
        handleUploadFinish(res, obj) {
            if (this.$refs?.input) {
                // 可上传上一次传过的文件
                this.$refs.input.value = null;
            }
            const { data, type } = res;
            if (type === 'err') {
                this.fileList = this.fileList.filter(f => f.id !== obj.id);
                this.$emit('uploadChange', this.fileList.length, this.uploadMap, this.privatePreviewMap);
                return false;
            }

            // 标记已经上传的
            this.uploadMap[data.key] = true;
            obj.key = data.key;

            if (this.multiple) {
                this.$emit('update:modelValue', this.fileList.filter(f => !!f.key).map(r => r.key));
            } else {
                this.$emit('update:modelValue', data.key);
            }

            if (this.isPrivate) {
                this.privatePreviewMap[data.key] = data.url;
            }
            this.$emit('uploadChange', this.fileList.length, this.uploadMap, this.privatePreviewMap);
        }
    }
};
</script>
<style lang="scss" scoped>
@import 'common/style/static';

$box-size: 208px;

.file-upload {
    position: relative;
    display: flex;
    flex-wrap: wrap;

    &.cols-2 {
        .upload-item {
            &:nth-child(2n) {
                margin-right: 0;
            }
        }
    }

    &.cols-3 {
        .upload-item {
            &:nth-child(3n) {
                margin-right: 0;
            }
        }
    }

    .upload-box {
        position: relative;
        width: $box-size;
        height: $box-size;
        background-color: $input-disabled;
        border-radius: 12px;

        .add-box {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 5;

            .iconfont {
                font-size: 82px;
                color: rgba($black, 0.2);
            }

            .text {
                line-height: 32px;
                font-size: $fs24;
                text-align: center;
                color: rgba($black, 0.4);
            }
        }

        .file-box {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 8;
            border-radius: 16px;
            background-color: transparent;
            opacity: 0;
        }
    }
}
</style>
