<template>
  <div class="admin-page">
    <common-form :data_list="search_list" :form_data.sync="search_form" :select_data="select_data"
      @submit-form="pageChange({ pageNum: 1, limit: page_info.limit })"></common-form>
    <common-table :data="table_data" :props="props" :page_info="page_info" @page-change="pageChange"
      @edit-item="({ value, key, index }) => editItem({ type: '', value, key, index })">
      <template #image="{ row, index }">
        <el-image v-if="row.output&&row.output.url" class="image" fit="cover" :src="row.output.url"
          :preview-src-list="[row.output.url]">
        </el-image>
      </template>
      <template #image_url="{ row, index }">
        <el-tooltip v-if="row.output&&row.output.url" class="item" effect="dark" :content="row.output.url"
          placement="top">
          <div class="text-overflow3" v-copy-text="row.output.url" style="max-width: 100%;">
            {{ row.output.url }}
          </div>
        </el-tooltip>
      </template>
      <template #size="{ row }">
        {{ row.size.width }}X{{ row.size.height }}
      </template>
      <template #prompt="{ row }">
        <el-tooltip class="item" effect="dark" :content="row.input.Prompt || row.input.prompt" placement="top">
          <div class="text-overflow3" v-copy-text="row.input.Prompt || row.input.prompt" style="max-width: 100%;">
            {{ row.input.Prompt || row.input.prompt }}
          </div>
        </el-tooltip>
      </template>
    </common-table>
  </div>
</template>
 
<script>
module.exports = {
  name: 'application-image',
  components: {
    'common-table': 'url:/admin/components/common/common-table.vue',
    'common-form': 'url:/admin/components/common/common-form.vue',
  },
  data: () => ({
    props: [
      { label: '图片', key: 'image', min_width: 200, slot_name: 'image', },
      { label: '图片路径', key: 'image_url', min_width: 200, slot_name: 'image_url', },
      { label: '尺寸', key: 'size', min_width: 160, slot_name: 'size', },
      { label: '指令', key: 'prompt', min_width: 160, slot_name: 'prompt' },
      { label: '用户', key: 'user', min_width: 300, user_slot: true, },
      { label: '创建时间', key: 'createdAt', min_width: 160, filter: 'formateTime' },
      { label: '更新时间', key: 'updatedAt', min_width: 160, filter: 'formateTime' },
    ],
    table_data: [],
    page_info: {
      page_num: 1,
      limit: 10,
      total: 0
    },
    search_list: [
      { label: '指令', key: 'user_input', type: 'input' },
    ],
    search_form: {
      user_input: '',
    },
    select_data: {
      // 选择用的数据
    },
    query_data: {
      user_input: 'contains',
    },
    class_name: 'KSImage',
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
        q.include('user')
        q.limit(limit)
        q.skip(limit * (page_num - 1))
        q.descending('createdAt')
      })
        .then(res => {
          let { data, count } = res.data
          this.page_info.total = count
          this.table_data = data.map(item => {
            item.size = this.getSize(item)
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
    getSize(item) {
      let { input } = item
      let width = input.width || (input.ResultConfig?.Resolution.split(':')[0]) || 768
      let height = input.height || (input.ResultConfig?.Resolution.split(':')[1]) || 768
      return {
        width,
        height
      }
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