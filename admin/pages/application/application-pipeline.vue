<template>
  <div class="admin-page">
    <common-form :data_list="search_list" :form_data.sync="search_form" :select_data="select_data"
      @submit-form="pageChange({ pageNum: 1, limit: page_info.limit })"></common-form>
    <div class="flex mb-main">
      <el-button type="primary" @click.stop="addItem">新增</el-button>
    </div>
    <common-table :data="table_data" :props="props" :page_info="page_info" @page-change="pageChange"
      @edit-item="({ value, key, index }) => editItem({ type: '', value, key, index })">
      <template #application_list_data="{ row, index }">
        <div class="flex-c" style="height: 300px;">
          <div class="flex mb-half">
            <el-button type="primary" @click="addApplicationItem(index)">新增内容项</el-button>
          </div>
          <common-table v-if="row.application_list_data && row.application_list_data.length"
            :data="row.application_list_data" :props="application_props"
            @edit-item="(item_data) => editApplicationItem({  item_data, index })" border>
            <el-table-column label="操作" min-width="50" align="center">
              <div slot-scope="{ row, $index }">
                <el-button size="mini" type="text" @click.stop="deleteApplicationItem({ index, sub_index: $index })">删除
                </el-button>
              </div>
            </el-table-column>
          </common-table>
        </div>
      </template>
      <el-table-column label="操作" :min-width="120" align="center">
        <div slot-scope="{ row,$index }">
          <el-button size="mini" type="text" @click.stop="addItem({ copy_data: row })">复制</el-button>
          <el-button size="mini" type="text" @click.stop="deleteItem({ row,index: $index })">删除</el-button>
        </div>
      </el-table-column>
    </common-table>
  </div>
</template>
 
<script>
module.exports = {
  name: 'application-pipeline',
  components: {
    'common-table': 'url:/admin/components/common/common-table.vue',
    'common-form': 'url:/admin/components/common/common-form.vue',
  },
  data: () => ({
    props: [
      { label: '流水线内容', key: 'application_list_data', width: 100, expand: true, slot_name: 'application_list_data' },
      { label: '排序', key: 'sort', width: 100, edit_type: 'number' },
      { label: '名称', key: 'name', min_width: 160, edit_type: 'input' },
      { label: '描述', key: 'description', min_width: 180, edit_type: 'input' },
      { label: 'id', key: 'objectId', min_width: 200, copytext: true },
      { label: '路径', key: 'url', min_width: 300, edit_type: 'input' },
      { label: 'web路径', key: 'web_url', min_width: 300, edit_type: 'input' },
      { label: '背景图', key: 'bg', min_width: 160, edit_type: 'image_url' },
    ],
    table_data: [],
    page_info: {
      page_num: 1,
      limit: 10,
      total: 0
    },
    search_list: [
      { label: '名称', key: 'name', type: 'input' },
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
    class_name: 'KSApplicationPipeline',
    empty_item: {
      // 默认新增的item信息
      sort: 0,
      name: '新应用',
      description: '新应用',
    },
    application_props: [
      { label: '排序', key: 'sort', width: 100, edit_type: 'number' },
      { label: '关联应用', key: 'application', min_width: 160, edit_type: 'relation', object_class: 'KSApplication' },
    ],
    application_empty_item: {
      sort: 0,
      application_id: '64a298ee9ae3847a63cddb48',
      application_list: [{ name: '通用应用' }]
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
        q.include('application_list')
        q.descending('createdAt')
      })
        .then(res => {
          let { data, count } = res
          this.page_info.total = count
          this.table_data = data.map(i => {
            let item = i.toJSON()
            // 处理数据
            item.application_list_data = item.application_list.map((item, index) => {
              return {
                application_id: item.objectId,
                application_list: [item],
                sort: index
              }
            })
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
    addApplicationItem(index) {
      this.table_data[index].application_list_data.push(this.application_empty_item)
      this.editItem({ index, key: 'application_list', value: this.table_data[index].application_list_data.map(i => lc.createObject('KSApplication', i.application_id)) })
    },
    editApplicationItem({ type, item_data, index }) {
      let { key, value } = item_data
      switch (key) {
        case 'sort':
          this.table_data[index].application_list_data.sort((a, b) => {
            return (+a[key]) - (+b[key])
          })
          break
        default:
          break
      }
      this.editItem({ index, key: 'application_list', value: this.table_data[index].application_list_data.map(i => lc.createObject('KSApplication', i.application_id)) })
    },
    deleteApplicationItem({ index, sub_index }) {
      this.table_data[index].application_list.splice(sub_index, 1)
      this.editItem({ index, key: 'application_list', value: this.table_data[index].application_list })
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