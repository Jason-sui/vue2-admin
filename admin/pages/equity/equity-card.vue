<template>
  <div class="admin-page">
    <common-form :data_list="search_list" :form_data.sync="search_form" :select_data="select_data"
      @submit-form="pageChange({ pageNum: 1, limit: page_info.limit })"></common-form>
    <div class="flex mb-main">
      <el-button type="primary" @click.stop="addItem">新增</el-button>
    </div>
    <common-table :data="table_data" :props="props" :page_info="page_info" @page-change="pageChange"
      @edit-item="({ value, key, index }) => editItem({ value, key, index })">
      <template #equity_list="{ row, index }">
        <el-tooltip class="item" effect="dark" placement="top">
          <div slot="content" style="white-space: pre-line">
            {{row.equity_list.length?row.equity_list.map(i=>`${i.name}:${$getListValueKey({value:i.platform,list:admin_mock_data.select_data.platform})}`||'').join('\n\n'):'权益设置'}}
          </div>
          <el-button size="mini" type="text" @click.stop="openEquitySetting({  row,index })">
            {{row.equity_list.length?row.equity_list.map(i=>`${i.name}:${$getListValueKey({value:i.platform,list:admin_mock_data.select_data.platform})}`||'').join(','):'权益设置'}}
          </el-button>
        </el-tooltip>
      </template>
      <el-table-column label="操作" :min-width="120" fixed="right" align="center">
        <div slot-scope="{ row,$index }">
          <el-button size="mini" type="text" @click.stop="addItem({ copy_data: row })">复制</el-button>
          <el-button size="mini" type="text" @click.stop="deleteItem({ row,index: $index })">删除</el-button>
        </div>
      </el-table-column>
    </common-table>
    <common-dialog :visible.sync="dialog" height="60vh" :append_to_body="true" @confirm="equityConfirm"
      @close="closeSetting">
      <equity-config ref="equity_config" :edit="false" :multiple_option="multiple_option"></equity-config>
    </common-dialog>
  </div>
</template>
 
<script>
module.exports = {
  name: 'equity-card',
  components: {
    'common-table': 'url:/admin/components/common/common-table.vue',
    'common-form': 'url:/admin/components/common/common-form.vue',
    'common-dialog': 'url:/admin/components/common/common-dialog.vue',
    'equity-config': 'url:./equity-config.vue',
  },
  props: {
    search_id: {
      type: String,
      default: () => ''
    },
  },
  data: () => ({
    dialog: false,
    props: [
      { label: '名称', key: 'name', min_width: 160, edit_type: 'input' },
      { label: '权益卡类型', key: 'type', min_width: 160, edit_type: 'select', select_list: admin_mock_data.select_data.equity_card_type },
      { label: 'ID', key: 'objectId', min_width: 160, copytext: true },
      { label: '权益组合', label_tooltip: '获取权益组合,选中之后可以设置权益组合', key: 'equity_list', min_width: 300, slot_name: 'equity_list' },
    ],
    table_data: [],
    page_info: {
      page_num: 1,
      limit: 10,
      total: 0
    },
    search_list: [
      { label: '名称', key: 'name', type: 'input' },
      { label: 'id', key: 'objectId', type: 'input' },
      { label: '权益卡类型', key: 'type', type: 'select' },
    ],
    search_form: {
      name: '',
      objectId: ''
    },
    select_data: {
      // 选择用的数据
      type: admin_mock_data.select_data.equity_card_type,
    },
    query_data: {
      name: 'contains',
    },
    class_name: 'KSEquityCard',
    empty_item: {
      name: '权益卡',
      type: 'member',
      equity_list: []
    },
    current_index: 0,
    current_type: '',
    multiple_option: {
      status: true,
      select_list: [],
      auto_set: true,
      select_change: 'key'
    }
  }),
  created() {
    if (this.search_id) this.search_form.objectId = this.search_id
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
        q.include('equity_list')
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
    closeSetting() {
      this.multiple_option.select_list = []
    },
    openEquitySetting({ type, index, row }) {
      this.current_index = index
      this.current_type = type
      this.multiple_option.select_list = row.equity_list || []
      this.dialog = true
    },
    equityConfirm() {
      let list = Array.from(this.$refs.equity_config.getMultipleSelection())
      let equity_list = list.map(i => lc.createObject('KSFunctionalLimitations', i))
      this.closeSetting()
      this.editItem({ type: this.current_type, value: equity_list, key: 'equity_list', index: this.current_index })
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