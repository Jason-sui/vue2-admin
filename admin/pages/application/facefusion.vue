<template>
  <div class="admin-page">
    <common-form :data_list="search_list" :form_data.sync="search_form" :select_data="select_data"
      @submit-form="pageChange({ pageNum: 1, limit: page_info.limit })"></common-form>
    <div class="flex mb-main">
      <el-button type="primary" @click.stop="addItem">新增</el-button>
      <el-button type="primary" @click.stop="drawer = true">预览</el-button>
    </div>
    <common-table :data="table_data" :props="props" :page_info="page_info" @page-change="pageChange"
      @edit-item="({ value, key, index }) => editItem({ type: 'text_list', value, key, index })">
      <el-table-column label="操作" :min-width="120" fixed="right" align="center">
        <div slot-scope="{ row,$index }">
          <el-button size="mini" type="text" @click.stop="addItem({ copy_data: row })">复制</el-button>
          <el-button size="mini" type="text" @click.stop="deleteItem({ row,index: $index })">删除</el-button>
        </div>
      </el-table-column>
    </common-table>
    <el-drawer custom-class="preview-page-container" :visible.sync="drawer" :with-header="false">
      <div v-if="drawer" class="preview-page">
        <preview :url="preview_url+'/pages/facefusion/facefusion'"></preview>
      </div>
    </el-drawer>
  </div>
</template>
 
<script>
module.exports = {
  name: 'facefusion',
  components: {
    'preview': 'url:/admin/components/preview.vue',
    'common-table': 'url:/admin/components/common/common-table.vue',
    'common-form': 'url:/admin/components/common/common-form.vue',
  },
  data: () => ({
    drawer: false,
    preview_url: window.util.platform.is_dev ? 'https://m-dev-1258317412.cos-website.ap-beijing.myqcloud.com' : 'https://m.kvker.com',
    props: [
      { label: '排序', key: 'sort', width: 100, edit_type: 'number' },
      { label: '标题', key: 'title', min_width: 160, edit_type: 'input' },
      { label: '是否禁用', key: 'disable', min_width: 160, edit_type: 'boolean' },
      { label: '活动id', key: 'project_id', min_width: 160, edit_type: 'input' },
      { label: '模型id', key: 'model_id', min_width: 160, edit_type: 'input' },
      { label: '视频路径', key: 'url', min_width: 160, edit_type: 'input' },
      { label: '封面图', key: 'image_url', min_width: 160, edit_type: 'image_url' },
    ],
    table_data: [],
    page_info: {
      page_num: 1,
      limit: 10,
      total: 0
    },
    search_list: [
      { label: '标题', key: 'name', type: 'input' },
      { label: '活动id', key: 'project_id', type: 'input' },
      { label: '模型id', key: 'model_id', type: 'input' },
    ],
    search_form: {
      name: ''
    },
    select_data: {
      // 选择用的数据
    },
    query_data: {
      name: 'contains',
      project_id: 'contains',
      model_id: 'contains',
    },
    class_name: 'KSTxFacefusionMaterial',
    empty_item: {
      // 默认新增的item信息
      disable: true,
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
        q.limit(limit)
        q.skip(limit * (page_num - 1))
        q.ascending('sort')
        q.addDescending('createdAt')
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
</style>