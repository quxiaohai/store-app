import { getUniqueId } from 'lib/util/digit';
import closest from 'lib/dom/closest';
import env from 'lib/comp/env';

/*********
 * 添加指命，完成触摸添加cls，离开去除cls，解决点击效果问题
 * @type {{}}
 * @private
 */

const _hoverList = {};

(function(isClient) {
    if (isClient) {
        document.body.addEventListener('touchstart', _bodyTouchStart, false);
        document.body.addEventListener('touchmove', _bodyMoveEnd, false);
        document.body.addEventListener('touchend', _bodyTouchEnd, false);
    }
})(env.isClient());

let _node = null, _cls = null, _option = null, _timer = null;

function _bodyTouchStart(ev) {
    _node = null;
    _cls = null;

    if (ev.touches.length > 1) return;

    let el = ev.target;
    let key = el.dataset.hkey;

    if (!key) {
        const node = closest(ev.target, '[data-hkey]');
        if (node) {
            el = node;
            key = node.dataset.hkey;
        }
    }
    const cls = _hoverList[key];

    if (cls) {
        _node = el;
        _cls = cls;
        _option = {
            pageX: ev.touches[0].pageX,
            pageY: ev.touches[0].pageY
        };
        if (!el.classList.contains(cls)) {
            el.classList.add(cls);
        }

        _timer = setTimeout(() => {
            _bodyTouchEnd();
        }, 1200);
    }
}

function _bodyMoveEnd(ev) {
    if (_option) {
        const x = ev.touches[0].pageX;
        const y = ev.touches[0].pageY;
        if (Math.abs(x - _option.pageX) >= 10 || Math.abs(y - _option.pageY) >= 10) {
            if (_node && _cls) {
                _node.classList.remove(_cls);
                _node = null;
                _cls = null;
            }
            _option = null;
        }
        clearTimeout(_timer);
    }
}

function _bodyTouchEnd() {
    if (_node && _cls) {
        _node.classList.remove(_cls);
        _node = null;
        _cls = null;
        clearTimeout(_timer);
    }
}

export default {
    created(el, binding) {
        const val = binding.value;
        if (val === '') return;
        const key = getUniqueId();
        _hoverList[key] = val;
        el.dataset.hkey = key;
    },
    update(el, binding) {
        const val = binding.value;
        const key = el.dataset.hkey;
        if (val === '') {
            delete _hoverList[key];
            return;
        }
        _hoverList[key] = val;
    }
};