<template>
  <div class="preview-iframe-box">
    <el-button @click="refresh">刷新</el-button>
    <iframe class="preview-iframe" :src="page_path" ref="iframe_ref" frameborder="0"></iframe>
  </div>
</template>
 
<script>
export default  {
  name: '预览页面',
  props: {
    url: {
      type: String,
      default: () => ''
    },
  },
  data: () => ({
    page_path: ''
  }),
  created() {
    this.page_path = this.url
  },
  methods: {
    refresh() {
      const iframe = this.$refs.iframe_ref
      iframe.src = this.page_path
    }
  },
}
</script>
 
<style scoped>
.preview-iframe-box {
  display: flex;
  flex-direction: column;
  width: calc(100% - 10px);
  height: 100%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.preview-iframe {
  width: 100%;
  height: 100%;
}
</style>