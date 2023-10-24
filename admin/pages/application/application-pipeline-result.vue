<template>
  <div class="admin-page">
    <common-table :data="table_data" :props="props" :page_info="page_info" @page-change="pageChange"
      @edit-item="({ value, key, index }) => editItem({ type: '', value, key, index })">
      <template #result_list="{ row, index }">
        <template v-for="(application,application_index) in row.application_pipeline.application_list">
          <template v-if="['image'].includes(application.type)">
            <el-image class="image" fit="cover" :src="row.result_list[application_index].output.url"
              :preview-src-list="[row.result_list[application_index].output.url]">
            </el-image>
          </template>
          <template v-if="['text'].includes(application.type)">
            <div class="flex-c" style="max-height:300px;overflow: auto;">
              <div style="white-space: pre-line !important;">
                {{row.result_list[application_index].answer}}
              </div>
            </div>
          </template>
        </template>
      </template>
      <el-table-column label="操作" :min-width="120" fixed="right" align="center">
        <div slot-scope="{ row,$index }">
          <el-button size="mini" type="text" @click.stop="deleteItem({ row,index: $index })">删除</el-button>
        </div>
      </el-table-column>
    </common-table>
  </div>
</template>
 
<script>
module.exports = {
  name: 'template-page',
  components: {
    'common-table': 'url:/admin/components/common/common-table.vue',
    'common-form': 'url:/admin/components/common/common-form.vue',
  },
  data: () => ({
    props: [
      { label: '应用', key: 'application_pipeline', min_width: 160, filter: 'getObjectKey', filterParams: ['name'] },
      { label: '应用id', key: 'application_pipeline', min_width: 160, filter: 'getObjectKey', filterParams: ['objectId'], copytext: true },
      { label: '结果', key: 'result_list', min_width: 160, slot_name: 'result_list' },
    ],
    table_data: [],
    page_info: {
      page_num: 1,
      limit: 10,
      total: 0
    },
    search_form: {
      name: ''
    },
    select_data: {
      // 选择用的数据
    },
    query_data: {
      name: 'contains',
    },
    class_name: 'KSApplicationPipelineResult',
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
        q.include(['result_list', 'application_pipeline', 'application_pipeline.application_list'])
        q.limit(limit)
        q.skip(limit * (page_num - 1))
        q.ascending('sort')
        q.addDescending('createdAt')
      })
        .then(res => {
          let { data, count } = res
          this.page_info.total = count
          this.table_data = data.map((i, index) => {
            let item = i.toJSON()
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
    downLoadAll({ row }) {
      switch (row.type) {
        case 'image2image':
        case 'text2image':
          this.downLoadImageList(row.image_list)
          break
        case 'chat':
          this.downloadTextFile(row.answer_list.join('\n\n###\n\n'), `${row.application.name + new Date().getTime()}.txt`)
          break
      }
    },
    downLoadImageList(list) {
      list.forEach((url, index) => {
        util.downloadImg(url, `frame-${index}`)
      })
    },
    downloadTextFile(content, filename = 'a.txt',) {
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = filename

      // 将链接添加到 DOM 并触发点击事件
      document.body.appendChild(a)
      a.click()

      // 清理临时资源
      URL.revokeObjectURL(url)
      a.remove()
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