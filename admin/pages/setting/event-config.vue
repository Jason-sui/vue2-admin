<template>
  <div class="admin-page">
    <common-form :data_list="search_list" :form_data.sync="search_form"
      @submit-form="pageChange({ pageNum: 1, limit: page_info.limit })"></common-form>
    <common-table :data="table_data" :props="props" :page_info="page_info" @page-change="pageChange">
    </common-table>
  </div>
</template>
 
<script>
module.exports = {
  name: 'event-config',
  components: {
    'common-table': 'url:/admin/components/common/common-table.vue',
    'common-form': 'url:/admin/components/common/common-form.vue',
  },
  data: () => ({
    drawer: false,
    preview_url: '',
    props: [
      { label: '名称', key: 'name', min_width: 160, },
      { label: '描述', key: 'description', min_width: 160, },
      { label: '平台', key: 'platform', min_width: 160, },
      { label: '版本号', key: 'version', min_width: 160, },
      { label: '埋点数据', key: 'data', min_width: 160, filter: 'formatObject', copytext: true },
      { label: '公共数据', key: 'public_data', min_width: 160, filter: 'formatObject', copytext: true },
      { label: '用户', key: 'user', min_width: 160, user_slot: true },

    ],
    table_data: [],
    search_list: [
      { label: '名称', key: 'name', type: 'input' },
      { label: '描述', key: 'description', type: 'input' },
      { label: '平台', key: 'platform', type: 'input' },
      { label: '版本号', key: 'version', type: 'input' },
    ],
    search_form: {
      name: '',
      description: '',
      platform: '',
      version: ''
    },
    page_info: {
      page_num: 1,
      limit: 10,
      total: 0
    },
    query_data: {
      name: 'contains',
      description: 'contains'
    },
    class_name: 'KSEvent',
    empty_item: {
      // 默认新增的item信息
    },
  }),
  created() {
    this.pageChange(this.page_info)
  },
  methods: {
    pageChange({ page_num = 1, limit = 10 } = {}, class_name = this.class_name) {
      if (!class_name) return
      this.page_info.page_num = page_num
      this.page_info.limit = limit
      this.$loading()
      lc.readTotal(class_name, (q) => {
        q = this.$setQuery(q, this.search_form, this.query_data)
        q.include('user')
        q.limit(limit)
        q.skip(limit * (page_num - 1))
        q.descending('createdAt')
      })
        .then(res => {
          let { data, count } = res
          this.page_info.total = count
          this.table_data = data.map(i => {
            let item = i.toJSON()
            // 处理数据
            return item
          })
        })
        .catch(err => {
          console.log(err)
          this.$alert(err.rawMessage)
        })
        .finally(() => {
          this.$loading().close()
        })
    },

  },
}
</script>
 
<style scoped>
.preview-page-container {
  min-width: 395px !important;
  width: 395px !important;
  padding-left: 10px;
  padding-top: 10px;
}

.preview-page {
  width: 385px;
  height: 835px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
</style>