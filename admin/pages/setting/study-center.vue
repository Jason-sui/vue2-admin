<template>
  <div class="admin-page">
    <common-form :data_list="search_list" :form_data.sync="search_form" :select_data="select_data"
      @submit-form="pageChange({ pageNum: 1, limit: page_info.limit })"></common-form>
    <div class="flex mb-main">
      <el-button type="primary" @click.stop="addItem">新增</el-button>
    </div>
    <common-table :data="table_data" :props="props" :page_info="page_info" @page-change="pageChange"
      @edit-item="({ value, key, index }) => editItem({ type: 'stuty', value, key, index })">
      <template #content="{ row, index }">
        <div class="flex-c" style="height: 300px;">
          <div class="flex mb-half">
            <el-button type="primary" @click="addContentItem(index)">新增内容项</el-button>
          </div>
          <common-table v-if="row.content && row.content.length" :data="row.content" :props="content_props"
            @edit-item="(item_data) => editContentItem({ type: 'stuty', item_data, index })" border>
            <template #application="contentItem">
              <el-select v-model="contentItem.row.application_id" remote filterable clearable
                :default-first-option="true"
                :remote-method="(query) => getAppliation({ row: contentItem.row, index, sub_index: contentItem.index, query, type: 'application_list' })"
                :loading="row.loading"
                @change="(value) => changeApplication({ row, index, value, sub_index: contentItem.index, })">
                <el-option v-for="item in contentItem.row.application_list" :key="item.objectId" :label="item.name"
                  :value="item.objectId"></el-option>
              </el-select>
            </template>
            <el-table-column label="操作" min-width="50" fixed="right" align="center">
              <div slot-scope="{ row, $index }">
                <el-button size="mini" type="text" @click.stop="deleteContentItem({ index, sub_index: $index })">删除
                </el-button>
              </div>
            </el-table-column>
          </common-table>
        </div>
      </template>
      <el-table-column label="操作" :min-width="200" align="center">
        <div slot-scope="{ row,$index }">
          <el-button size="mini" type="text" @click.stop="addItem({ copy_data: row })">复制</el-button>
          <el-button size="mini" type="text" @click.stop="getItemUrl({ row })">复制链接</el-button>
          <el-button size="mini" type="text" @click.stop="previewItem({ row })">预览</el-button>
          <el-button size="mini" type="text" @click.stop="deleteItem({row, index: $index })">删除</el-button>
        </div>
      </el-table-column>
    </common-table>
    <el-drawer custom-class="preview-page-container" :visible.sync="drawer" :with-header="false">
      <div class="preview-page" v-if="drawer">
        <preview :url="preview_url"></preview>
      </div>
    </el-drawer>
  </div>
</template>
 
<script>
module.exports = {
  name: 'study-center',
  components: {
    'preview': 'url:/admin/components/preview.vue',
    'common-table': 'url:/admin/components/common/common-table.vue',
    'common-form': 'url:/admin/components/common/common-form.vue',
  },
  data: () => ({
    drawer: false,
    preview_url: '',
    props: [
      { label: '页面内容', key: 'content', width: 100, expand: true, slot_name: 'content' },
      { label: '排序', key: 'sort', width: 100, edit_type: 'number' },
      { label: 'id', key: 'objectId', min_width: 180 },
      { label: '页面标题', key: 'name', label_tooltip: '为空则默认为一步AI学习平台', min_width: 160, edit_type: 'input' },
    ],
    table_data: [],
    page_info: {
      page_num: 1,
      limit: 10,
      total: 0
    },
    search_list: [
      { label: '页面标题', key: 'name', type: 'input' },
    ],
    search_form: {
      name: ''
    },
    select_data: {
      // 选择用的数据
    },
    query_data: {
      name: 'contains',
    },
    class_name: 'KSStudyCenter',
    empty_item: {
      // 默认新增的item信息
      name: '教程名称',
      content: []
    },
    content_props: [
      { label: '排序', key: 'sort', width: 100, edit_type: 'number' },
      { label: '标题', key: 'title', min_width: 160, edit_type: 'input' },
      { label: '内容', key: 'content', min_width: 200, edit_type: 'textarea' },
      { label: 'tip', key: 'tip', min_width: 200, edit_type: 'input' },
      { label: '图片', key: 'image_url', min_width: 200, edit_type: 'image_url' },
      { label: 'iframe链接', key: 'iframe_url', min_width: 200, edit_type: 'input' },
      { label: '视频', key: 'video_url', min_width: 200, edit_type: 'input' },
      { label: '上方间距', label_tooltip: '与上方元素的间距', key: 'margin_top', min_width: 100, edit_type: 'number' },
      { label: '测试方法绑定的应用', label_tooltip: '根据应用的指令和配置设置默认输入和指令的模块,当页显示有缓存,教学页面中没有,是根据id重新获取的应用信息', key: 'application_id', min_width: 200, slot_name: 'application' },
    ],
    content_empty_item: {
      title: '',
      content: '',
      tip: '',
      margin_top: 20,
    }
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
      })
        .then(res => {
          let { data, count } = res
          this.page_info.total = count
          this.table_data = data.map(i => {
            let item = i.toJSON()
            // 处理数据
            return item
          })
          console.log(this.table_data)
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
    getItemUrl({ row }) {
      let base_url = window.util.platform.is_dev ? 'https://m-dev-1258317412.cos-website.ap-beijing.myqcloud.com' : 'https://m.kvker.com'
      let url = base_url + `/pages/study/study?id=${row.objectId}`
      util.copyText(url, () => {
        this.$toast('复制成功')
      })
    },
    previewItem({ row }) {
      console.log(row.objectId)
      let base_url = window.util.platform.is_dev ? 'https://m-dev-1258317412.cos-website.ap-beijing.myqcloud.com' : 'https://m.kvker.com'
      this.preview_url = base_url + `/pages/study/study?id=${row.objectId}`
      this.drawer = true
    },
    addContentItem(index) {
      this.table_data[index].content.push(this.content_empty_item)
      this.editItem({ index, key: 'content', value: this.table_data[index].content })
    },
    editContentItem({ type, item_data, index }) {
      let { key, value } = item_data
      switch (key) {
        case 'sort':
          this.table_data[index].content.sort((a, b) => {
            return (+a[key]) - (+b[key])
          })
          break
        default:
          break
      }
      this.editItem({ index, key: 'content', value: this.table_data[index].content })
    },
    deleteContentItem({ index, sub_index }) {
      this.table_data[index].content.splice(sub_index, 1)
      this.editItem({ index, key: 'content', value: this.table_data[index].content })
    },
    getAppliation({ row, index, sub_index, query, type }) {
      this.$set(this.table_data[index].content[sub_index], 'loading', true)
      lc.readTotal('KSApplication', (q) => {
        q.contains('name', query)
      })
        .then(res => {
          let { data, count } = res
          let list = data.map(i => i.toJSON())
          this.$set(this.table_data[index].content[sub_index], type, list)
          this.$set(this.table_data[index].content[sub_index], 'loading', false)
          console.log(this.table_data[0])
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
          this.$set(this.table_data[index].content[sub_index], 'loading', false)
        })
    },
    changeApplication({ value, index, sub_index }) {
      let application
      if (!value) {
        application = value
      } else {
        application = lc.createObject('KSApplication', value)
      }
      this.$set(this.table_data[index].content[sub_index], 'application', application)
      this.$set(this.table_data[index].content[sub_index], 'application_id', value)
      this.editItem({ index, key: 'content', value: this.table_data[index].content })
    }
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