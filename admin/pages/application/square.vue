<template>
  <div class="admin-page">
    <div class="w-100 h-100 flex">
      <div class="mr-main tabs-container flex-c">
        <el-tabs v-model="tab_active">
          <el-tab-pane label="图片广场管理" name="image">
            <div class="admin-page">
              <common-form :data_list="search_list" :form_data.sync="search_form" :select_data="select_data"
                @submit-form="pageChange({ pageNum: 1, limit: page_info.limit })"></common-form>
              <div class="flex mb-main">
                <el-button type="primary" :disabled="!multiple_selection.length" @click="listChange">批量通过</el-button>
              </div>
              <common-table :data="table_data" :props="props" :selection="true" :page_info="page_info"
                @page-change="pageChange" @sort-change="sortChange" @selection-change="handleSelectionChange"
                @edit-item="({ value, key, index }) => editItem({ type: 'image', value, key, index })">
                <template #image="{ row }">
                  <el-image class="image-item" fit="cover" :src="row.relation.output.url"
                    :preview-src-list="[row.relation.output.url]">
                  </el-image>
                </template>
                <template #size="{ row }">
                  {{ row.size.width }}X{{ row.size.height }}
                </template>
                <template #prompt="{ row }">
                  <el-tooltip class="item" effect="dark"
                    :content="row.relation.input.Prompt || row.relation.input.prompt" placement="top">
                    <div class="text-overflow3" v-copy-text="row.relation.input.Prompt || row.relation.input.prompt"
                      style="max-width: 100%;">
                      {{ row.relation.input.Prompt || row.relation.input.prompt }}
                    </div>
                  </el-tooltip>
                </template>
                <template #user="{ row }">
                  <div class="flex aic jcsb" @click="searchUser(row)">
                    <el-image class="avatar" fit="cover" :src="row.user.avatar_url"
                      :preview-src-list="[row.user.avatar_url]">
                    </el-image>
                    <div class="f1 ml-main flex-c">
                      <div v-copy-text class="text-overflow">{{ row.user.nickname || row.user.username }}</div>
                      <div v-copy-text class="text-overflow">{{ row.user.objectId }}</div>
                    </div>
                  </div>
                </template>
                <el-table-column label="操作" min-width="160" fixed="right" align="center">
                  <div slot-scope="{ row }">
                    <el-button size="mini" type="text" @click.stop="deleteItem(row)">删除</el-button>
                  </div>
                </el-table-column>
              </common-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="应用广场管理" name="application">
            <div class="admin-page">
              <div class="flex mb-main">
                <el-button type="primary" :disabled="!multiple_selection.length" @click="listChange">批量通过</el-button>
              </div>
              <common-table :data="application_table_data" :props="application_props" :page_info="application_page_info"
                @page-change="applicationPageChange">

                <el-table-column label="操作" min-width="160" fixed="right" align="center">
                  <div slot-scope="{ row }">
                    <el-button size="mini" type="text" @click.stop="deleteItem(row)">删除</el-button>
                  </div>
                </el-table-column>
              </common-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>
 
<script>
module.exports = {
  name: 'square',
  components: {
    'common-table': 'url:/admin/components/common/common-table.vue',
    'common-form': 'url:/admin/components/common/common-form.vue',
  },
  data: () => {
    return {
      tab_active: 'image',
      search_title: '',
      search_user: null,
      order_key: '',
      order_type: '',
      form: {
        status: null,
      },
      multiple_selection: [],
      page_info: {
        page_num: 1,
        limit: 10,
        total: 0
      },
      table_data: [],
      props: [
        { label: '图片', key: 'image', min_width: 200, slot_name: 'image', },
        { label: '尺寸', key: 'size', min_width: 160, slot_name: 'size', },
        { label: '指令', key: 'prompt', min_width: 160, slot_name: 'prompt' },
        { label: '标题', key: 'title', min_width: 160, edit_type: 'input' },
        { label: '审核状态', key: 'status', min_width: 160, edit_type: 'select', select_list: [{ value: 0, label: '待审核' }, { value: 1, label: '已通过' }, { value: 2, label: '审核中' }, { value: 3, label: '拒绝' }] },
        { label: '不通过理由', key: 'reject_reason', min_width: 160, edit_type: 'reject_reason' },
        { label: '基础点赞数', key: 'base_like', min_width: 140, sortable: true, edit_type: 'number' },
        { label: '点赞数', key: 'like', min_width: 140, sortable: true, },
        { label: '用户', key: 'user', width: 200, slot_name: 'user' },
        { label: '创建时间', key: 'createdAt', min_width: 160, filter: 'formateTime' },
      ],
      search_list: [
        { label: '标题', key: 'title', type: 'input' },
        { label: '审核状态', key: 'status', type: 'select' },
      ],
      search_form: {
        title: '',
        status: 0
      },
      select_data: {
        status: [{ value: 0, label: '待审核' }, { value: 1, label: '已通过' }, { value: 2, label: '审核中' }, { value: 3, label: '拒绝' }],
      },
      query_data: {
        title: 'contains',
      },
      application_page_info: {
        page_num: 1,
        limit: 10,
        total: 0
      },
      application_table_data: [],
      application_props: [
        { label: '名称', label_tooltip: '应用名称唯一', key: 'name', min_width: 160, },
        { label: '应用说明', key: 'summary', min_width: 160, },
        { label: '前置指令', key: 'pre_prompt', min_width: 160 },
        { label: '指令', key: 'prompt', min_width: 160 },
        { label: '后置指令', key: 'tail_prompt', min_width: 160 },
        { label: '输入示例', key: 'example', min_width: 160 },
        { label: '输出示例', key: 'result_example', min_width: 160 },
        { label: '用户', key: 'user', min_width: 140, slot_name: 'user' },
        { label: '创建时间', key: 'createdAt', min_width: 160, filter: 'formateTime' },
      ],
      point_user_info: {},
      add_integration: null,
      current_row: {}
    }
  },
  computed: {

  },
  watch: {
    tab_active: {
      handler(val) {
        switch (val) {
          case 'image':
            this.pageChange({ page_num: 1, limit: this.page_info.limit })
            break
          case 'application':
            this.applicationPageChange({ page_num: 1, limit: this.application_page_info.limit })
            break
          default:
            break
        }
      },
      immediate: true,
    }
  },
  created() {
  },
  methods: {
    sortChange({ column, prop, order }) {
      if (order) {
        this.order_key = prop
        this.order_type = order
      } else {
        this.order_key = ''
      }
      this.pageChange({ page_num: 1, limit: this.page_info.limit })
    },
    formClear() {
      this.$refs['ruleForm'].resetFields()
      this.form = {
        status: null
      }
      this.search_user = null
      this.search_title = ''
      this.pageChange({ page_num: 1, limit: this.page_info.limit })
    },
    searchUser(row) {
      this.search_user = lc.createObject('_User', row.user.objectId)
      this.pageChange({ page_num: 1, limit: this.page_info.limit })
    },
    pageChange({ page_num = 1, limit = 10 } = {}) {
      this.page_info.page_num = page_num
      this.page_info.limit = limit
      lc.readTotal('KSSquare', (q) => {
        q = this.$setQuery(q, this.search_form, this.query_data)
        q.equalTo('type', 'ks_image')
        q.include('relation')
        q.include('user')
        q.limit(limit)
        q.skip(limit * (page_num - 1))
        q.ascending('status')
        q.descending('createdAt')
        if (this.order_key) {
          switch (this.order_type) {
            case 'descending':
              q.descending(this.order_key)
              break
            case 'ascending':
              q.ascending(this.order_key)
              break
            default:
              break
          }
        }
      })
        .then(res => {
          let { data, count } = res
          this.page_info.total = count
          if (!data.length && this.search_title) throw { rawMessage: '标题查询失败' }
          this.table_data = data.map(i => {
            let item = i.toJSON()
            item.size = this.getSize(item.relation)
            return item
          })
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
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
    editItem({ type, key, index, value }) {
      switch (type) {
        default:
          lc.update('KSSquare', this.table_data[index].objectId, { [key]: value })
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
    deleteItem(row) {
      this.$confirm('确认删除？')
        .then(() => {
          lc.delete('KSSquare', row.objectId)
            .then(() => {
              this.pageChange(this.page_info)
            })
            .catch(err => {
              console.log(err)
              this.$alert(err)
            })
        })
    },
    handleSelectionChange(val) {
      this.multiple_selection = val
    },
    listChange() {
      console.log(this.multiple_selection)
      let request_list = this.multiple_selection.map((i) => {
        console.log(i)
        return lc.update('KSSquare', i.objectId, { status: 1 })
      })
      Promise.all(request_list)
        .then(res => {
          this.pageChange(this.page_info)
          this.$toast('更改成功')
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
        })
    },
    applicationPageChange({ page_num = 1, limit = 10 } = {}) {
      this.application_page_info.page_num = page_num
      this.application_page_info.limit = limit
      lc.readTotal('KSSquare', (q) => {
        q.equalTo('type', 'ks_application')
        q.include('relation')
        q.include('user')
        q.limit(limit)
        q.skip(limit * (page_num - 1))
        q.ascending('status')
        q.descending('createdAt')
        if (this.order_key) {
          switch (this.order_type) {
            case 'descending':
              q.descending(this.order_key)
              break
            case 'ascending':
              q.ascending(this.order_key)
              break
            default:
              break
          }
        }
      })
        .then(res => {
          let { data, count } = res
          this.page_info.total = count
          if (!data.length && this.search_title) throw { rawMessage: '标题查询失败' }
          this.table_data = data.map(i => {
            let item = i.toJSON()
            item.size = this.getSize(item.relation)
            return item
          })
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
        })
    },
  },
}
</script>

<style scoped>
.image-item {
  height: 300px;
  width: 100%;
}

.avatar {
  width: 40px;
  min-width: 40px;
  height: 40px;
  border-radius: 50%;
}
</style>