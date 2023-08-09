const options = {
  moduleCache: {
    vue: Vue
  },
  pathResolve({ refPath, relPath }) {
    return String(new URL(relPath, refPath === undefined ? window.location : refPath))
  },
  getFile: async (url) => {

    return fetch(url).then(res => res.text())
  },
  addStyle(textContent) {

    const style = Object.assign(document.createElement('style'), { textContent });
    const ref = document.head.getElementsByTagName('style')[0] || null;
    document.head.insertBefore(style, ref);
  },
}

const { loadModule } = window['vue2-sfc-loader']

const importHtmlVue = (url) => loadModule(url, options)