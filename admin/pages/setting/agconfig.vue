<template>
  <div class="admin-page">
    <common-form :data_list="search_list" :form_data.sync="search_form" :select_data="select_data"
      @submit-form="pageChange({ pageNum: 1, limit: page_info.limit })"></common-form>
    <div class="flex mb-main">
      <el-button type="primary" @click.stop="addItem">新增</el-button>
    </div>
    <common-table :data="table_data" :props="props" :page_info="page_info" @page-change="pageChange"
      @edit-item="({ value, key, index }) => editItem({ type: '', value, key, index })">
      <el-table-column label="操作" :min-width="120" fixed="right" align="center">
        <div slot-scope="{ row,$index }">
          <el-button size="mini" type="text" @click.stop="addItem({ copy_data: row })">复制</el-button>
        </div>
      </el-table-column>
    </common-table>
  </div>
</template>
 
<script>
module.exports = {
  name: 'agconfig',
  components: {
    'common-table': 'url:/admin/components/common/common-table.vue',
    'common-form': 'url:/admin/components/common/common-form.vue',
  },
  data: () => ({
    props: [
      { label: '配置信息', key: 'config_data', min_width: 160, edit_type: 'json' },
      { label: '服务端配置', key: 'config_server_data', min_width: 160, edit_type: 'json' },
      { label: '结束时间', key: 'end_time', min_width: 160, edit_type: 'number' },
      { label: 'id', key: 'objectId', min_width: 160, copytext: true },
      { label: '信息', key: 'message', min_width: 160, edit_type: 'input' },
      { label: '平台', key: 'platform', min_width: 160, edit_type: 'input' },
      { label: '类型', key: 'type', min_width: 160, edit_type: 'input' },
    ],
    table_data: [],
    page_info: {
      page_num: 1,
      limit: 10,
      total: 0
    },
    search_list: [
      { label: '平台', key: 'platform', type: 'input' },
      { label: '类型', key: 'type', type: 'input' },
    ],
    search_form: {
      platform: '',
      type: ''
    },
    select_data: {
      // 选择用的数据
    },
    query_data: {
      type: 'contains',
    },
    class_name: 'AGConfig',
    empty_item: {
      // 默认新增的item信息
      type: "config",
      end_time: 0,
      platform: 'ALL'
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
      lc.readTotalAdmin(class_name, (q) => {
        q = this.$setQuery(q, this.search_form, this.query_data)
        q.limit(limit)
        q.skip(limit * (page_num - 1))
        q.descending('createdAt')
      })
        .then(res => {
          let { data, count } = res.data
          this.page_info.total = count
          this.table_data = data
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
        })
        .finally(() => {
          this.$loading().close()
        })
    },
    addItem({ type, copy_data }) {
      let request
      let class_data = {}
      switch (type) {
        default:
          class_data = {
            class_name: this.class_name,
          }
          if (copy_data && copy_data.objectId) {
            request = lc.run('copyClassData', {
              ...class_data,
              id: copy_data.objectId
            })
          } else {
            // 新增的默认数据
            request = lc.create(class_data.class_name, this.empty_item)
          }
          request
            .then(() => {
              this.pageChange({ page_num: 1, limit: this.page_info.limit })
            })
            .catch(err => {
              console.log(err)
              this.$alert(err)
            })
          break
      }
    },
    editItem({ type, key, index, value }) {
      switch (type) {
        default:
          lc.update(this.class_name, this.table_data[index].objectId, { [key]: value })
            .then(res => {
              this.pageChange(this.page_info)
              this.$toast('更改成功,刷新后查看变更')
            })
            .catch(err => {
              console.log(err)
              this.$alert(err)
            })
          break
      }
    },
    deleteItem({ type, row, index }) {
      this.$confirm('确认删除？')
        .then(() => {
          switch (type) {
            default:
              lc.delete(this.class_name, row.objectId)
                .then(() => {
                  this.pageChange(this.page_info)
                })
                .catch(err => {
                  console.log(err)
                  this.$alert(err)
                })
              break
          }
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

.image-item {
  height: 300px;
  width: 100%;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
</style>