<template>
  <div class="admin-page">
    <common-form :data_list="search_list" :form_data.sync="search_form" :select_data="select_data"
      @submit-form="pageChange({ pageNum: 1, limit: page_info.limit })"></common-form>
    <div class="flex mb-main">
      <el-button type="primary" @click.stop="addItem">新增</el-button>
    </div>
    <common-table ref="common_table" :data="table_data" :props="props" :page_info="page_info" :selection="!edit"
      @page-change="pageChange" :multiple_option="multiple_option"
      @edit-item="({ value, key, index }) => editItem({ type: 'text_list', value, key, index })"
      @selection-change="handleSelectionChange">
      <el-table-column label="操作" :min-width="120" fixed="right" align="center">
        <div slot-scope="{ row,$index }">
          <el-button size="mini" type="text" @click.stop="addItem({ copy_data: row })">复制</el-button>
          <el-button size="mini" type="text" @click.stop="deleteItem({ row,index: $index })">删除</el-button>
        </div>
      </el-table-column>
    </common-table>
  </div>
</template>
 
<script>
let vm
module.exports = {
  name: 'equity-config',
  components: {
    'common-table': 'url:/admin/components/common/common-table.vue',
    'common-form': 'url:/admin/components/common/common-form.vue',
  },
  props: {
    edit: {
      type: Boolean,
      default: () => true
    },
    multiple_option: {
      type: Object,
      default: () => ({})
    },
  },
  data: () => {
    return {
      props: [
        { label: '排序', key: 'sort', min_width: 160, edit_type: 'number' },
        { label: '名称', label_tooltip: '权益卡里展示的名称', key: 'name', min_width: 160, edit_type: 'input' },
        { label: '描述', label_tooltip: '权益卡里展示的描述', key: 'description', min_width: 160, edit_type: 'input' },
        { label: '图标', label_tooltip: '权益卡里展示的图标', key: 'icon', min_width: 160, edit_type: 'image_url' },
        { label: '限制的key', label_tooltip: '根据对应的key限制功能,可以为空,为空不要绑定到应用上,没有效果', key: 'key', min_width: 160, edit_type: 'input' },
        { label: '是否显示', key: 'is_show', label_tooltip: '权益卡里展示或者隐藏', min_width: 160, edit_type: 'boolean' },
        {
          label: '限制类型', label_tooltip: '登录用户无此权益需要的操作,默认为看广告或者开会员,可限制为开会员', key: 'limit_type', min_width: 160, edit_type: 'select', select_list: admin_mock_data.select_data.limit_type
        },
        {
          label: '平台', label_tooltip: '默认为全平台', key: 'platform', min_width: 160, edit_type: 'select', select_list: admin_mock_data.select_data.platform
        }
      ],
      table_data: [],
      page_info: {
        page_num: 1,
        limit: 10,
        total: 0
      },
      search_list: [
        { label: '名称', key: 'name', type: 'input' },
        { label: 'key', key: 'key', type: 'input' },
        { label: '限制类型', key: 'limit_type', type: 'select' },
        { label: '平台', key: 'platform', type: 'select' },
      ],
      search_form: {
        name: '',
        key: '',
        limit_type: '',
        platform: ''
      },
      
      select_data: {
        // 选择用的数据
        limit_type: admin_mock_data.select_data.limit_type,
        platform: admin_mock_data.select_data.platform,
      },
      query_data: {
        name: 'contains',
      },
      class_name: 'KSFunctionalLimitations',
      empty_item: {
        // 默认新增的item信息
        sort: 0,
        name: '名称',
        description: '描述',
        key: 'key',
        limit_type: "2",
        platform: 'ALL',
        is_show: true,
      },
      multiple_selection: []
    }
  },
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
          this.callback && this.callback(this.table_data)
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
    handleSelectionChange(val) {
      this.multiple_selection = val
    },
    setMultipleSelection(list) {
      console.log(list)
      if (!list.length) {
        this.$refs.common_table.clearSelection()
        return
      }
      let id_list = list.map(i => i.objectId)
      let rows = this.table_data.filter(i => id_list.includes(i.objectId))
      this.$refs.common_table.toggleRowSelection(this.table_data)
    },
    getMultipleSelection() {
      return this.multiple_selection
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