<template>
    <span v-if="!$slots.default">{{ dates }}</span>
    <div v-else>
        <slot :date="{days, hours, minutes, seconds, dates}"/>
    </div>
</template>
<script>
const MILLISECONDS_SECOND = 1000;
const MILLISECONDS_MINUTE = 60 * MILLISECONDS_SECOND;
const MILLISECONDS_HOUR = 60 * MILLISECONDS_MINUTE;
const MILLISECONDS_DAY = 24 * MILLISECONDS_HOUR;

export default {
    name: 'count-down',
    props: {
        autoStart: {
            type: Boolean,
            default: true
        },
        formats: {
            type: String,
            default: 'dd天hh时mm分ss秒'
        },
        interval: {
            type: Number,
            default: 1000
        },
        time: {
            type: Number,
            default: 0
        },
        // 是否显示递减, 如果为true, 当时间为0的会剔除 最多剔除到时, 分和秒始终会保留
        decrease: {
            type: Boolean,
            default: false
        }
    },
    emits: ['start', 'end', 'progress'],
    watch: {
        time() {
            this.initTimer();
        }
    },
    created() {
        this.initTimer();
    },
    unmounted() {
        this.destroy();
    },
    data() {
        return {
            count: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            counting: false
        };
    },
    computed: {
        dates() {
            return this.getFormats();
        }
    },
    methods: {
        initTimer() {
            this.count = Math.max(0, this.time);
            this.formatTime();
            // 如果初始化小于等于0，直接停止
            if (this.count <= 0) {
                return this.stop();
            }
            if (this.autoStart) {
                this.startTimer();
            }
        },
        getFormats() {
            let o = {
                'd+': this.days,
                'h+': this.hours,
                'm+': this.minutes,
                's+': this.seconds
            };
            let format = this.formats;

            if (this.decrease) {
                const reg = /([d]{1,2}[\w\W]+?)([h]{1,2}[\w\W]+?)([m]{1,2}[\w\W]*)/;
                const res = format.match(reg) || [];
                if (res.length >= 3) {
                    if (this.days === 0) {
                        format = format.replace(res[1], '');
                        if (this.hours === 0) {
                            format = format.replace(res[2], '');
                        }
                    }
                }
            }

            for (let k in o) {
                if (new RegExp('(' + k + ')').test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(o[k].toString().length));
                }
            }
            return format;
        },

        getSeconds() {
            const interval = this.interval;
            const seconds = (this.count % MILLISECONDS_MINUTE) / MILLISECONDS_SECOND;

            if (interval < 10) {
                return seconds.toFixed(3);
            } else if (interval >= 10 && interval < 100) {
                return seconds.toFixed(2);
            } else if (interval >= 100 && interval < 1000) {
                return seconds.toFixed(1);
            }

            return Math.floor(seconds);
        },

        formatTime() {
            const vm = this;
            vm.days = Math.max(0, Math.floor(vm.count / MILLISECONDS_DAY));
            vm.hours = Math.max(0, Math.floor((vm.count % MILLISECONDS_DAY) / MILLISECONDS_HOUR));
            vm.minutes = Math.max(0, Math.floor((vm.count % MILLISECONDS_HOUR) / MILLISECONDS_MINUTE));
            vm.seconds = Math.max(0, vm.getSeconds());
        },
        startTimer() {
            if (this.count <= 0) {
                return this.stop();
            } else if (this.counting) {
                return false;
            }

            this.$emit('start');
            this.counting = true;

            const interval = this.interval;
            this.timeout = setInterval(() => {
                this.count -= interval;
                this.formatTime();
                this.step();
            }, interval);

            this.step();
        },
        step() {
            if (!this.counting) {
                return false;
            }

            this.$emit('progress', {
                days: this.days,
                hours: this.hours,
                minutes: this.minutes,
                seconds: this.seconds
            });

            if (this.count <= 0) {
                this.stop();
            }
        },

        stop() {
            this.destroy();
            // 加个定时器，延迟推送，解决服务端执行后，客户端再执行无效的问题
            setTimeout(() => {
                this.$emit('end');
            }, 0);
        },
        destroy() {
            this.counting = false;
            clearInterval(this.timeout);
            this.timeout = null;
        },
        reset() {
            this.count = this.time;
        }
    }
};
</script>
