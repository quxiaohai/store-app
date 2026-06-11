function _getTitle (vm) {
  const { title } = vm.$options;
  if (title) {
    return typeof title === 'function'
      ? title.call(vm)
      : title
  }
}

function _getKeywords(vm) {
  const { keywords } = vm.$options;
  if (keywords) {
    return typeof keywords === 'function'
      ? keywords.call(vm)
      : keywords
  }
}

let _metes = [];

function _createMeta(doc, name, content) {
  let meta = doc.createElement("meta");
  meta.name = name;
  meta.content = content;

  return meta;
}

function _createTitle() {
  const title = _getTitle(this);
  const keywords = _getKeywords(this);
  if (title) {
    document.title = `${title}`
  }
  if (keywords) {
    if (_metes.length > 0) {
      _metes[0].content = keywords.desc;
      _metes[1].content = keywords.words;
      return;
    }
    const doc = document;
    const header = doc.getElementsByTagName("head")[0];
    _metes.push(_createMeta(doc, 'description', keywords.desc));
    _metes.push(_createMeta(doc, 'keywords', keywords.words));
    _metes.forEach(item => {
      header.appendChild(item);
    });
  }
}

const serverHeadMixin = {
  created () {
    const title = _getTitle(this);
    const keywords = _getKeywords(this);
    if (title) {
      this.$ssrContext.title = `${title}`
    }
    if (keywords) {
      this.$ssrContext.description = `${keywords.desc}`;
      this.$ssrContext.keywords = `${keywords.words}`;
    }
  }
};



const clientHeadMixin = {
  mounted () {
    _createTitle.call(this);
    this.$broadcast.on('seo', _createTitle.bind(this));
  }
};

export default process.env.VUE_ENV === 'server'
  ? serverHeadMixin
  : clientHeadMixin
