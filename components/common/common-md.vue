<template>
  <div class="markdown-box">
    <div v-if="edit_able" class="button-box">
      <el-button class="markdown-button" type="text" :disabled="editing&&!input_value"
        @click="clickEdit">{{editing?'确认':'编辑'}}</el-button>
    </div>
    <div class="content-scroll">
      <template v-if="editing||!input_value">
        <el-input v-model="input_value" class="markdown-input" type="textarea" :autosize="{ minRows: 5}"></el-input>
      </template>
      <template v-else>
        <div v-show="!editing&&markdown_content" v-copy-text="input_value" v-html="markdown_content"
          class="markdown-container"></div>
      </template>
    </div>
  </div>
</template>

<script>
export default  {
  name: 'common-md',
  props: {
    edit_able: {
      type: Boolean,
      default: () => true
    },
    value: {
      type: String,
      default: () => ''
    },
    default_status: {
      type: Boolean,
      default: () => false
    },
  },
  data() {
    return {
      input_value: '',
      markdown_content: '',
      editing: false,
      md: null
    }
  },
  watch: {
    value: {
      handler(val) {
        this.input_value = this.value
      },
      deep: true
    },

  },
  created() {
    this.input_value = this.value
    this.editing = this.default_status
    if (!this.editing && this.input_value) {
      this.$nextTick()
        .then(() => {
          this.markdown_content = this.md.render(this.input_value)
          this.renderMermaid()
        })
    }
  },
  mounted() {
    this.initializeMarkdown()
  },
  methods: {
    clickEdit() {
      this.editing = !this.editing
      if (!this.editing) {
        this.markdown_content = this.md.render(this.input_value)
        this.renderMermaid()
        this.$emit('input', this.input_value)
        this.$emit('change', this.input_value)
      }
    },
    initializeMarkdown() {
      let defaults = {
        xhtmlOut: true,
        breaks: false,
        langPrefix: 'language-',
        html: true,
        linkify: true,
        typographer: true,
      }

      defaults.highlight = (str, lang) => {
        var esc = this.md.utils.escapeHtml
        if (lang && hljs.getLanguage(lang)) {
          try {
            return '<pre class="hljs"><code>' +
              hljs.highlight(lang, str, true).value +
              '</code></pre>'
          } catch (__) { }
        } else if (lang == 'mermaid') {
          return `<div class="mermaid">${str}</div>`
        } else {
          return '<pre class="hljs"><code>' + esc(str) + '</code></pre>'
        }
      }
      this.md = window.markdownit(defaults)
      this.md.use(window.markdownitTaskLists, { enable: true })
      this.md.use(window.markdownitEmoji)
      this.md.validateLink = function () { return true }
    },
    renderMermaid() {
      this.$nextTick(() => {
        mermaid.run({
          querySelector: `.mermaid`,
        })
      })
    }
  },
};
</script>

<style scoped>
.markdown-box {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  width: 100%;
  flex: 1;
  text-align: left !important;
}

.content-scroll {
  width: 100%;
  flex: 1;
  overflow: auto;
}

.markdown-input {
  width: 100%;
  height: 100%;
}

.markdown-container {
  width: 100%;
  height: 100%;
}
</style>
