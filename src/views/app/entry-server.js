import {renderToString} from 'vue/server-renderer'
import {_createApp} from './main'
import {_createStore} from 'common/store';
import {_createRouter} from 'common/router';

if (typeof globalThis.ShadowRoot === 'undefined') {
    globalThis.ShadowRoot = class ShadowRoot {};
}

function createSsrDomElement(tagName = 'div') {
    return {
        tagName: tagName.toUpperCase(),
        children: [],
        firstChild: null,
        parentNode: null,
        innerHTML: '',
        className: '',
        style: {},
        setAttribute(key, value) {
            this[key] = value;
        },
        getAttribute(key) {
            return this[key];
        },
        appendChild(child) {
            child.parentNode = this;
            this.children.push(child);
            this.firstChild = this.children[0] || null;
            return child;
        },
        insertBefore(child, reference) {
            child.parentNode = this;
            const index = this.children.indexOf(reference);
            if (index === -1) {
                this.children.push(child);
            } else {
                this.children.splice(index, 0, child);
            }
            this.firstChild = this.children[0] || null;
            return child;
        },
        removeChild(child) {
            const index = this.children.indexOf(child);
            if (index > -1) {
                this.children.splice(index, 1);
            }
            child.parentNode = null;
            this.firstChild = this.children[0] || null;
            return child;
        },
        contains(child) {
            return this === child || this.children.includes(child);
        }
    };
}

function installSsrDomStubs() {
    if (typeof window !== 'undefined' || typeof document !== 'undefined') {
        return () => {};
    }

    const head = createSsrDomElement('head');
    const body = createSsrDomElement('body');
    const ssrDocument = {
        body,
        createElement: createSsrDomElement,
        querySelector(selector) {
            return selector === 'head' ? head : null;
        },
        contains(child) {
            return child === head || child === body || head.contains(child) || body.contains(child);
        }
    };

    globalThis.document = ssrDocument;
    globalThis.window = {document: ssrDocument};
    globalThis.getComputedStyle = () => ({content: ''});

    return () => {
        delete globalThis.document;
        delete globalThis.window;
        delete globalThis.getComputedStyle;
    };
}

/**
 * @param {string} _url
 */
export async function render(_url) {
    const router = _createRouter();
    const store = _createStore();
    const {app} = _createApp({router, store});

    await router.push(_url === '/' ? '/index' : _url);
    await router.isReady();

    // passing SSR context object which will be available via useSSRContext()
    // @vitejs/plugin-vue injects code into a component's setup() that registers
    // itself on ctx.modules. After the render, ctx.modules would contain all the
    // components that have been instantiated during this render call.
    const ctx = {}
    const cleanupSsrDom = installSsrDomStubs();
    let html = '';
    try {
        html = await renderToString(app, ctx)
        await Promise.resolve();
        await new Promise(resolve => setTimeout(resolve, 0));
    } finally {
        cleanupSsrDom();
    }

    return {html, state: store.state}
}
