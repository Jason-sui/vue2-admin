<template>
  <div class="admin-page">
    <common-form :data_list="search_list" :form_data.sync="search_form" :select_data="select_data"
      @submit-form="pageChange({ pageNum: 1, limit: page_info.limit })"></common-form>
    <common-table :data="table_data" :props="props" :page_info="page_info" @page-change="pageChange"
      @edit-item="({ value, key, index }) => editItem({ type: '', value, key, index })">
      <template #square_data="{ row }">
        <div>{{row.square_data.title}}</div>
        <template v-if="row.square_data.type==='ks_image'">
          <el-image class="image-item" fit="cover" :src="row.square_data.relation.output.url"
            :preview-src-list="[row.square_data.relation.output.url]">
          </el-image>
        </template>
      </template>
      <template #square_data_prompt="{ row }">
        <el-tooltip class="item" effect="dark" :content="row.square_data.relation.input.Prompt || row.square_data.relation.input.prompt"
          placement="top">
          <div class="text-overflow3" v-copy-text="row.square_data.relation.input.Prompt || row.square_data.relation.input.prompt"
            style="max-width: 100%;">
            {{ row.square_data.relation.input.Prompt || row.square_data.relation.input.prompt }}
          </div>
        </el-tooltip>
      </template>
      <el-table-column label="操作" :min-width="120" fixed="right" align="center">
        <div slot-scope="{ row,$index }">
          <el-button size="mini" type="text" @click.stop="handleItemPointStatus({ row: row })">对应数据下线</el-button>
          <el-button size="mini" type="text" @click.stop="deleteItem({ row,index: $index })">删除</el-button>
        </div>
      </el-table-column>
    </common-table>
  </div>
</template>
 
<script>
module.exports = {
  name: 'square-complain',
  components: {
    'common-table': 'url:/admin/components/common/common-table.vue',
    'common-form': 'url:/admin/components/common/common-form.vue',
  },
  data: () => ({
    props: [
      { label: '投诉理由', key: 'reason', min_width: 160, },
      { label: '数据', key: 'square_data', min_width: 160, slot_name: 'square_data' },
      { label: '指令', key: 'square_data_prompt', min_width: 160, slot_name: 'square_data_prompt' },
      { label: '处理状态', key: 'status', min_width: 160, edit_type: 'select', select_list: admin_mock_data.select_data.handle_status },
      { label: '用户', key: 'user', min_width: 160, user_slot: 'user' },
    ],
    table_data: [],
    page_info: {
      page_num: 1,
      limit: 10,
      total: 0
    },
    search_list: [
      { label: '状态', key: 'status', type: 'select', },
    ],
    search_form: {
      status: 0
    },
    select_data: {
      // 选择用的数据
      status: admin_mock_data.select_data.handle_status
    },
    query_data: {
      name: 'contains',
    },
    class_name: 'KSSquareComplain',
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
        q.include('square_data')
        q.include('square_data.relation')
        q.include('user')
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
    handleItemPointStatus({ row }) {
      let square_id = row.square_data.objectId
      lc.update(this.class_name, row.objectId, { status: 1 })
        .then(() => {
          return lc.update('KSSquare', square_id, { 'status': 2 })
        })
        .then(() => {
          this.pageChange(this.page_info)
          this.$toast('更改成功,刷新后查看变更')
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
        })
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