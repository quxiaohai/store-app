<template>
    <div class="m-dialog-toast" :class="{'show-icon': !!type}">
        <div v-if="type" class="icon flex-center">
            <i class="iconfont" :class="'icon-' + type"></i>
        </div>
        <div v-html="text"></div>
    </div>
</template>
<script>
function calcProgress(progress, expression) {
    const tokens = expression.match(/[+\-*/]\s*-?\d+(?:\.\d+)?/g);
    if (!tokens || tokens.join('').replace(/\s/g, '') !== expression.replace(/\s/g, '')) {
        return progress;
    }

    let result = Number(progress);
    tokens.forEach((token) => {
        const operator = token.trim().charAt(0);
        const value = Number(token.trim().substring(1));
        if (!Number.isFinite(value)) return;
        if (operator === '+') result += value;
        if (operator === '-') result -= value;
        if (operator === '*') result *= value;
        if (operator === '/' && value !== 0) result /= value;
    });
    return parseFloat(result.toFixed(2));
}

export default {
    props: ['msg', 'type'],
    data() {
        return {
            text: this.msg
        };
    },
    mounted() {
        if ((this.msg + '').match(/\{\s*time([\w\W]*)\}/)) {
            this.$event.on('progress', this.message);
        }
    },
    methods: {
        change(obj) {
            this.text = this.msg.replace(/\{\s*time([\w\W]*)\}/g, function() {
                const reg = RegExp.$1.trim();
                if (reg.length > 0) {
                    return calcProgress(obj.progress, reg);
                }
                return obj.progress;
            });
        },
        message(obj) {
            try {
                this.change({progress: obj});
            } catch (e) {
                console.log('解析出错');
            }
        }
    }
};
</script>
<style lang="scss" scoped>
@import "common/style/static";

.m-dialog-toast {
    font-size: $fs32;
    min-width: 120px;
    background-color: rgba($gray-dark, 0.9);
    border-radius: 16px;
    text-align: center;
    padding: 32px 72px;
    color: $white;
    max-width: 560px;
    line-height: 40px;
    word-break: break-all;

    &.show-icon {
        padding: 32px 42px;
    }

    .icon {
        padding-bottom: 24px;
    }

    .iconfont {
        font-size: $fs48;
    }
}
</style>
