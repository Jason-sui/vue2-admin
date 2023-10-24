<template>
  <div class="admin-page">
    <div class="w-100 h-100 flex">
      <div class="mr-main tabs-container flex-c">
        <div>
          <el-button type="primary" @click="drawer = true">预览</el-button>
        </div>
        <el-tabs v-model="tab_active">
          <template v-for="(tab_item, index) in tab_list">
            <el-tab-pane :label="tab_item.label" :name="tab_item.name" :key="index">
              <div class="admin-page" v-if="tab_data[tab_item.name]">
                <common-form :data_list="tab_data[tab_item.name].search_list"
                  :form_data.sync="tab_data[tab_item.name].search_form"
                  :select_data="tab_data[tab_item.name].select_data"
                  @submit-form="pageChange({ pageNum: 1, limit: tab_data[tab_item.name].page_info.limit })">
                </common-form>
                <div class="flex mb-main">
                  <el-button type="primary" @click="addItem({ type: tab_item.name })">新增</el-button>
                  <el-button type="primary" @click="tab_type_list_drawer = true">应用分类设置</el-button>
                </div>
                <template v-if="tab_data[tab_item.name]">
                  <common-table :data="tab_data[tab_item.name].list" :props="tab_data[tab_item.name].props"
                    :page_info="tab_data[tab_item.name].page_info"
                    @edit-item="({ value, key, index }) => editItem({ type: tab_data[tab_item.name], value, key, index })"
                    @page-change="pageChange">
                    <template #type="{ row, index }">
                      <el-select v-model="row.type" placeholder="应用入口类型"
                        @change="(value) => editItem({ type: tab_data[tab_item.name], value, key: 'type', index })">
                        <el-option v-for="item in tab_list" :key="item.name" :label="item.label" :value="item.name">
                        </el-option>
                      </el-select>
                    </template>
                    <template #tab_type="{ row, index }">
                      <el-select v-model="row.tab_type" placeholder="应用类型"
                        @change="(value) => editItem({ type: tab_data[tab_item.name], value, key: 'tab_type', index })">
                        <el-option v-for="item in tab_type_list" :key="item.value" :label="item.label"
                          :value="item.value">
                        </el-option>
                      </el-select>
                    </template>
                    <template #last_answer="{ row }">
                      <el-tooltip class="item" effect="dark" placement="top">
                        <div slot="content" style="white-space: pre-line">
                          {{ row.application&&row.application.last_answer }}
                        </div>
                        <div class="text-overflow3" v-copy-text="row.application&&row.application.last_answer"
                          style="max-width: 100%;">
                          {{ row.application&&row.application.last_answer }}
                        </div>
                      </el-tooltip>
                    </template>
                    <template #application="{ row, index }">
                      <el-select v-model="row.application_id" remote filterable :default-first-option="true"
                        :remote-method="(query) => getApplication({ row, index, query, type: 'application_list' })"
                        :loading="row.loading"
                        @change="(value) => changeApplication({ row, index, value, type: tab_data[tab_item.name], key: 'application' })">
                        <el-option v-for="item in row.application_list" :key="item.objectId" :label="item.name"
                          :value="item.objectId"></el-option>
                      </el-select>
                    </template>
                    <el-table-column label="操作" min-width="120" fixed="right" align="center">
                      <div slot-scope="{ row ,$index}">
                        <el-button size="mini" type="text"
                          @click.stop="addItem({ type: tab_item.name, copy_data: row, index: $index })">复制</el-button>
                        <el-button size="mini" type="text"
                          @click.stop="deleteItem({ type: tab_item.name, row, index: $index })">删除</el-button>
                      </div>
                    </el-table-column>
                  </common-table>
                </template>
              </div>
            </el-tab-pane>
          </template>
        </el-tabs>
      </div>
    </div>
    <el-drawer custom-class="preview-page-container" :visible.sync="drawer" :with-header="false">
      <div class="preview-page">
        <preview :url="preview_url"></preview>
      </div>
    </el-drawer>
    <el-drawer :visible.sync="tab_type_list_drawer" :with-header="false">
      <div class="admin-page p-main">
        <div class="flex aic mb-main">
          <el-button type="primary" @click="addItem({ type: 'tab_type_list' })">新增</el-button>
        </div>
        <common-table :data="tab_type_list" :props="tab_type_props"
          @edit-item="({ value, key, index }) => editItem({ type: 'tab_type_list', value, key, index })">
          <el-table-column label="操作" :min-width="120" fixed="right" align="center">
            <div slot-scope="{ row,$index }">
              <el-button size="mini" type="text"
                @click.stop="deleteItem({ index: $index, type: 'tab_type_list' })">删除</el-button>
            </div>
          </el-table-column>
        </common-table>
      </div>
    </el-drawer>
  </div>
</template>
 
<script>
module.exports = {
  name: 'application-application',
  components: {
    'preview': 'url:/admin/components/preview.vue',
    'common-table': 'url:/admin/components/common/common-table.vue',
    'common-form': 'url:/admin/components/common/common-form.vue',
    'common-upload': 'url:/admin/components/common/common-upload.vue',
  },
  data: () => ({
    preview_url: window.util.platform.is_dev ? 'https://m-dev-1258317412.cos-website.ap-beijing.myqcloud.com' : 'https://m.kvker.com',
    drawer: false,
    tab_type_list_drawer: false,
    tab_type_list: [],
    tab_list: [],
    tab_data: {},
    props: [
      { label: '排序', key: 'sort', width: 100, fixed: 'left', edit_type: 'number' },
      { label: '名称', key: 'name', min_width: 160, fixed: 'left', edit_type: 'input' },
      { label: '应用入口类型', label_tooltip: '区分tab入口', key: 'type', min_width: 160, slot_name: 'type' },
      { label: '应用类型', label_tooltip: '应用分类搜索', key: 'tab_type', min_width: 160, slot_name: 'tab_type' },
      { label: '描述', key: 'description', min_width: 160, edit_type: 'input' },
      { label: '关联应用', key: 'application', min_width: 160, edit_type: 'relation', object_class: 'KSApplication' },
      { label: '最近生成结果', key: 'last_answer', min_width: 160, slot_name: 'last_answer' },
      { label: '是否禁用', label_tooltip: '禁用的配置可以在预生产预览,线上不会显示', key: 'disable', min_width: 160, edit_type: 'boolean' },
      { label: '禁用的平台', label_tooltip: '禁用掉的平台不显示入口', key: 'disable_platform', min_width: 300, edit_type: 'select', select_multiple: true, select_list: admin_mock_data.select_data.platform },
      { label: '跳转类型', key: 'nav_type', min_width: 160, edit_type: 'select', select_list: admin_mock_data.select_data.nav_type },
      { label: '路径', key: 'url', min_width: 300, edit_type: 'input' },
      { label: 'web路径', key: 'web_url', min_width: 350, edit_type: 'input' },
      { label: '是否banner', key: 'is_banner', min_width: 160, edit_type: 'boolean' },
      { label: '背景图', key: 'bg', min_width: 160, edit_type: 'image_url' },
      { label: 'icon', key: 'icon', min_width: 160, edit_type: 'image_url' },
      { label: 'tag', key: 'tag', min_width: 160, edit_type: 'image_url' },
      { label: '按钮图标', key: 'button_icon', min_width: 160, edit_type: 'image_url' },
      { label: '头像', key: 'avatar', label_tooltip: '官网模型体验专用的', min_width: 160, edit_type: 'image_url' },
      { label: '方法名(必填)', label_tooltip: '未填写计数为0,用作计数(必填)', key: 'func_name', min_width: 160, edit_type: 'input' },
      { label: '第二方法名', label_tooltip: '未绑定应用时用作计数(非必填)', key: 'sub_func_name', min_width: 160, edit_type: 'input' },
      { label: '方法Key', label_tooltip: '未绑定应用时用作计数(非必填)', key: 'key', min_width: 160, edit_type: 'input' },
    ],
    tab_type_props: [
      { label: '名称', key: 'label', min_width: 160, edit_type: 'input' },
      { label: 'value', key: 'value', min_width: 160, edit_type: 'input' },
    ],
    tab_active: 'hot',
    query_data: {
      name: 'contains',
      description: 'contains',
    },
  }),
  computed: {
    currentTableData() {
      return (this.tab_data[`${this.tab_active}`] && this.tab_data[`${this.tab_active}`].list) || []
    }
  },
  watch: {
    tab_active(val) {
      this.getData()
        .then(res => {
          this.pageChange(this.tab_data[`${this.tab_active}`].page_info)
        })
    }
  },
  created() {
    this.getApplicationConfig()
  },
  methods: {
    // 获取设置
    getApplicationConfig() {
      lc.read('AGConfig', (q) => {
        q.equalTo('type', 'index_config_application')
        q.limit(1)
      })
        .then(([res]) => {
          if (!res) throw '配置获取失败'
          let config_data = res.get('config_data')
          this.tab_list = config_data.data
          console.log(this.tab_list)
          setTimeout(() => {
            this.tab_active = this.tab_list[0].name
          })
        })
        .catch(err => {
          throw err
        })
    },
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
    async getData(name = this.tab_active) {
      if (!this.tab_type_list.length) await this.getTabTypeConfig()
      if (!this.tab_data[`${name}`]) {
        this.$set(this.tab_data, `${name}`, {})
        this.$set(this.tab_data[`${name}`], 'list', [])
        this.$set(this.tab_data[`${name}`], 'page_info', {
          page_num: 1,
          limit: 10,
          total: 0
        })
        this.$set(this.tab_data[`${name}`], 'search_form', {})
        this.$set(this.tab_data[`${name}`], 'search_list', [
          { label: '应用名', key: 'name', type: 'input' },
          { label: '应用说明', key: 'description', type: 'input' },
          { label: '应用类型', key: 'tab_type', type: 'select' },
        ])
        this.$set(this.tab_data[`${name}`], 'select_data', {
          tab_type: this.tab_type_list
        })
        this.$set(this.tab_data[`${name}`], 'props', this[`${name}_props`] || this.props)
      }
      return Promise.resolve()
    },
    pageChange({ page_num = 1, limit = 10 } = {}, name = this.tab_active) {
      this.tab_data[`${name}`].page_info.page_num = page_num
      this.tab_data[`${name}`].page_info.limit = limit
      this.$loading()
      lc.readTotal('KSApplicationTab', (q) => {
        q = this.$setQuery(q, this.tab_data[`${name}`].search_form, this.query_data)
        q.include('application')
        q.equalTo('user', lc.createObject('_User', this.$config.master_user_id))
        q.equalTo('type', name)
        q.ascending('sort')
        q.addDescending('tab_type')
        q.addDescending('createdAt')
        q.limit(limit)
        q.skip(limit * (page_num - 1))
      })
        .then(res => {
          let { data, count } = res
          this.tab_data[`${name}`].page_info.total = count
          this.$set(this.tab_data[`${name}`], 'list', data.map(i => {
            let item = i.toJSON()
            item.application_id = item.application && item.application.objectId
            item.application_list = (item.application && [item.application]) || []
            return item
          }))
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
      let data = {}
      let request
      let class_data = {}
      switch (type) {
        case 'tab_type_list':
          this.tab_type_list.push({
            value: ''
          })
          this.editItem({ type })
          break
        default:
          class_data = {
            class_name: 'KSApplicationTab',
          }
          if (copy_data && copy_data.objectId) {
            request = lc.run('copyClassData', {
              ...class_data,
              id: copy_data.objectId
            })
          } else {
            data = {
              "name": new Date().getTime() + '',
              "description": "",
              "type": type,
              "sort": 0,
              status: 1,
              disable: true,
              application: lc.createObject('KSApplication', this.$config.base_app_id),
              user: lc.createObject('_User', this.$config.master_user_id),
            }
            request = lc.create(class_data.class_name, data)
          }
          request
            .then(() => {
              this.pageChange(this.tab_data[`${this.tab_active}`].page_info)
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
        case 'tab_type_list':
          lc_object = lc.createObject('AGConfig', this.tab_type_config_id)
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
          lc.update('KSApplicationTab', this.currentTableData[index].objectId, { [key]: value })
            .then(res => {
              this.pageChange(this.tab_data[`${this.tab_active}`].page_info)
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
          lc.delete('KSApplicationTab', row.objectId)
            .then(() => {
              this.pageChange(this.tab_data[`${this.tab_active}`].page_info)
            })
            .catch(err => {
              console.log(err)
              this.$alert(err)
            })
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