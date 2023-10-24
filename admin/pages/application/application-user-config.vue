<template>
  <div class="admin-page">
    <div class="flex mb-main">
      <el-button type="primary" @click="drawer = true">默认背景图设置</el-button>
    </div>
    <common-form :data_list="search_list" :form_data.sync="search_form" :select_data="select_data"
      @submit-form="pageChange({ pageNum: 1, limit: page_info.limit })"></common-form>
    <common-table :data="table_data" :props="props" :page_info="page_info" @page-change="pageChange"
      @edit-item="({ value, key, index }) => editItem({ type: 'text_list', value, key, index })">
      <template #tab_type="{ row, index }">
        <el-select v-model="row.tab_type" placeholder="应用类型"
          @change="(value) => editItem({ type: 'text_list', value, key: 'tab_type', index })">
          <el-option v-for="item in tab_type_list" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </template>
      <template #application="{ row }">
        <el-tooltip class="item" effect="dark" placement="top">
          <div slot="content" style="white-space: pre-line">
            {{row.application.objectId }}
          </div>
          <div class="text-overflow3" v-copy-text="row.application.objectId" style="max-width: 100%;">
            {{row.application.objectId }}
          </div>
        </el-tooltip>
      </template>
      <template #last_answer="{ row }">
        <el-tooltip class="item" effect="dark" placement="top">
          <div slot="content" style="white-space: pre-line">
            {{row.application.last_answer }}
          </div>
          <div class="text-overflow3" v-copy-text="row.application.last_answer" style="max-width: 100%;">
            {{row.application.last_answer }}
          </div>
        </el-tooltip>
      </template>
      <template #test_answer="{ row }">
        <template v-if="row.application.is_sending">
          <i class="el-icon-loading"></i>
        </template>
        <el-tooltip v-else-if="row.application.test_answer" class="item" effect="dark" placement="top">
          <div slot="content" style="white-space: pre-line">
            {{row.application.test_answer }}
          </div>
          <div class="text-overflow3" v-copy-text="row.application.test_answer" style="max-width: 100%;">
            {{row.application.test_answer }}
          </div>
        </el-tooltip>
      </template>
      <el-table-column label="操作" :min-width="120" fixed="right" align="center">
        <div slot-scope="{ row,$index }">
          <el-button size="mini" type="text" @click.stop="previewItem({  row })">预览</el-button>
          <el-button size="mini" type="text" @click.stop="testItem({ row,index:$index })">测试</el-button>
        </div>
      </el-table-column>
    </common-table>
    <el-drawer custom-class="preview-page-container" :visible.sync="drawer" :with-header="false">
      <div class="admin-page p-main">
        <div class="flex aic mb-main">
          <el-button type="primary" @click="addItem({ type: 'default_tab_bg' })">新增</el-button>
        </div>
        <common-table :data="default_tab_bg" :props="default_tab_bg_props"
          @edit-item="({ value, key, index }) => editItem({ type: 'default_tab_bg', value, key, index })">
          <el-table-column label="操作" :min-width="120" fixed="right" align="center">
            <div slot-scope="{ row,$index }">
              <el-button size="mini" type="text"
                @click.stop="deleteItem({ row,index: $index, type: 'default_tab_bg' })">删除
              </el-button>
            </div>
          </el-table-column>
        </common-table>
      </div>
    </el-drawer>
  </div>
</template>
 
<script>
module.exports = {
  name: 'application-user-config',
  components: {
    'preview': 'url:/admin/components/preview.vue',
    'common-table': 'url:/admin/components/common/common-table.vue',
    'common-form': 'url:/admin/components/common/common-form.vue',
  },
  data: () => {
    return {
      drawer: false,
      preview_url: window.util.platform.is_dev ? 'https://m-dev-1258317412.cos-website.ap-beijing.myqcloud.com' : 'https://m.kvker.com',
      props: [
        { label: '名称', key: 'name', min_width: 160 },
        { label: '关联应用id', key: 'application', min_width: 200, slot_name: 'application' },
        { label: '用户', key: 'user', min_width: 300, user_slot: true, },
        { label: '最近生成结果', key: 'last_answer', min_width: 160, slot_name: 'last_answer' },
        { label: '应用类型', label_tooltip: '应用分类搜索', key: 'tab_type', min_width: 160, slot_name: 'tab_type' }, { label: '状态', key: 'status', min_width: 160, edit_type: 'select', select_list: admin_mock_data.select_data.status },
        { label: '未通过理由', key: 'reject_reason', min_width: 160, edit_type: 'input' },
        { label: '禁用的平台', label_tooltip: '禁用掉的平台不显示入口', key: 'disable_platform', min_width: 300, edit_type: 'select', select_multiple: true, select_list: admin_mock_data.select_data.platform },
        { label: '应用tab类型', key: 'type', min_width: 160, edit_type: 'select', select_list: admin_mock_data.select_data.tab_type_list },
        { label: '跳转类型', key: 'nav_type', min_width: 160, edit_type: 'select', select_list: admin_mock_data.select_data.nav_type },
        { label: '路径', key: 'url', min_width: 300, edit_type: 'input' },
        { label: 'web路径', key: 'web_url', min_width: 350, edit_type: 'input' },
        { label: '是否banner', key: 'is_banner', min_width: 160, edit_type: 'boolean' },
        { label: '背景图', key: 'bg', min_width: 160, edit_type: 'image_url' },
        { label: 'icon', key: 'icon', min_width: 160, edit_type: 'image_url' },
        { label: 'tag', key: 'tag', min_width: 160, edit_type: 'image_url' },
        { label: '按钮图标', key: 'button_icon', min_width: 160, edit_type: 'image_url' },
        { label: '测试结果', key: 'test_answer', min_width: 160, slot_name: 'test_answer' },
      ],
      tab_type_list: [],
      table_data: [],
      page_info: {
        page_num: 1,
        limit: 10,
        total: 0
      },
      search_list: [
        { label: '名称', key: 'name', type: 'input' },
        { label: '应用描述', key: 'description', type: 'input' },
        { label: 'tab类型', key: 'type', type: 'select' },
        { label: '状态', key: 'status', type: 'select' },
      ],
      search_form: {
        name: '',
        description: ''
      },
      select_data: {
        // 选择用的数据
        status: admin_mock_data.select_data.status,
        type: admin_mock_data.select_data.tab_type_list,
      },
      query_data: {
        name: 'contains',
      },
      class_name: 'KSApplicationTab',
      empty_item: {
        // 默认新增的item信息
      },
      default_tab_bg: [],
      default_tab_bg_props: [
        { label: '图片', label_tooltip: '随机选择一张作为背景', key: 'url', edit_type: 'image_url' },
      ],
      config_id: ''
    }
  },
  created() {
    this.getDefaultTabBg()
    this.getTabTypeConfig()
    this.pageChange(this.page_info)
  },
  methods: {
    getTabTypeConfig() {
      return lc.read('AGConfig', (q) => {
        q.equalTo('type', 'tab_type')
        q.limit(1)
      })
        .then(([res]) => {
          if (!res) throw '配置获取失败'
          let config_data = res.get('config_data')
          this.tab_type_config_id = res.id
          this.$set(this, 'tab_type_list', config_data.data)
          return Promise.resolve()
        })
        .catch(err => {
          throw err
        })
    },
    getDefaultTabBg() {
      lc.one('AGConfig', q => {
        q.equalTo('type', 'application_default_bg')
      })
        .then(res => {
          let data = res.toJSON()
          this.config_id = data.objectId
          this.default_tab_bg = data.config_data.data
        })
    },
    pageChange({ page_num = 1, limit = 10 } = {}, class_name = this.class_name) {
      if (!class_name) return
      this.page_info.page_num = page_num
      this.page_info.limit = limit
      this.$loading()
      lc.readTotal(class_name, (q) => {
        q = this.$setQuery(q, this.search_form, this.query_data)
        q.include('application')
        q.include('user')
        q.notEqualTo('user', lc.createObject('_User', this.$config.master_user_id))
        q.ascending('sort')
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
        case 'default_tab_bg':
          this.default_tab_bg.push({
            url: ''
          })
          this.editItem({ type })
          break
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
      let lc_object
      switch (type) {
        case 'default_tab_bg':
          lc_object = lc.createObject('AGConfig', this.config_id)
          lc_object.set(`config_data.data`, this[type])
          lc_object.save()
            .then(() => {
              this.$toast('更改成功')
            })
            .catch(err => {
              console.log(err)
              this.$alert(err)
            })
          break
        default:
          let request = lc.update(this.class_name, this.table_data[index].objectId, { [key]: value })
          if (key === 'status') {
            request = lc.update(this.class_name, this.table_data[index].objectId, { disable: value !== 1 })
              .then(res => {
                console.log(res)
                return lc.update(this.class_name, this.table_data[index].objectId, { [key]: value })
              })
          }
          request
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
            case 'default_tab_bg':
              this.default_tab_bg.splice(index, 1)
              this.editItem({ type })
              break
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
    previewItem({ row }) {
      let base_url = window.util.platform.is_dev ? 'https://m-dev-1258317412.cos-website.ap-beijing.myqcloud.com' : 'https://m.kvker.com'
      this.preview_url = base_url + `/pages/application/application?id=${row.objectId}`
      this.drawer = true
    },
    testItem({ row, index }) {
      this.$set(this.table_data[index].application, 'is_sending', true)
      let application = row.application
      lc.run('applicationChatTest', {
        user_input: application.prompt,
        messages: [{
          role: 'user',
          content: (application.pre_prompt || '') + application.prompt + (application.tail_prompt || '')
        }],
        application_id: application.objectId,
        model_type: application.model_type || 'yiyan'
      }, { history: false })
        .then((res) => {
          this.queryResult(res.data.objectId, index)
        })
        .catch((error) => {
          this.$alert(error)
        })
    },
    queryItemResult({ classs = '', id = '' } = {}, { timeout = 3000, max_time = 60000 } = {}) {
      return new Promise((resolve, reject) => {
        let interval = setInterval(() => {
          lc.readItem(classs, { id })
            .then(res => {
              if (res && res.get('status') !== 0) {
                clearInterval(interval)
                resolve(res)
              } else if (!res) {
                clearInterval(interval)
                reject('查询失败')
              }
            })
        }, timeout)
        let timer = setTimeout(() => {
          clearInterval(interval)
          clearTimeout(timer)
          reject('查询超时')
        }, max_time)
      })
    },
    queryResult(id, index) {
      this.queryItemResult({ classs: 'KSApplicationChatTest', id })
        .then(res => {
          console.log(res)
          let data = res.toJSON()
          switch (data.status) {
            case 1:
              let answer = data.answer
              this.$set(this.table_data[index].application, 'test_answer', answer)
              break
            case -1:
              this.$set(this.table_data[index].application, 'test_answer', data.output.msg)
              break
            default:
              break
          }
        })
        .catch(error => {
          this.$alert(error)
        })
        .finally(() => {
          this.$set(this.table_data[index].application, 'is_sending', false)
        })
    },
  }
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

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
</style>