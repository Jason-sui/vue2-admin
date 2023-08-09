<template>
    <el-pagination
      :current-page="currentPage"
      :page-sizes="page_size_list"
      :page-size="limit"
      :layout="layout"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
</template>
<script>
 export default  {
  props: {
    page_info: {
      type: Object,
      default: () => ({}),
    },
    page_config: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      currentPage: 0,
      limit: 10,
      total: 1,
      later: false,
      page_size_list: [],
      layout: '',
    }
  },
  watch: {
    page_info: {
      handler(val) {
        this.initData()
      },
      deep: true,
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initData()
    })
  },
  methods: {
    initData() {
      this.total = this.page_info.total
      this.limit = this.page_info.limit || 10
      this.page_size_list = this.page_config?.page_size_list || [10, 20, 50, 100]
      this.layout = this.page_config?.layout || 'total, sizes, prev, pager, next, jumper'
      this.$nextTick(() => {
        this.currentPage = this.page_info.page_num || 1
      })
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
      this.later = true
      setTimeout(() => { this.later = false }, 500)
      this.$emit('page-change', { page_num: 1, limit: val })
    },
    handleCurrentChange(val) {
      if (!this.later) this.$emit('page-change', { page_num: val, limit: this.limit })
    },
  },
}
</script>
