<template>
  <div class="admin-page">
    <div class="w-100 h-100 flex">
      <div class="mr-main tabs-container flex-c">
        <el-tabs v-model="tab_active">
          <template v-for="(tab_item, index) in tab_list">
            <el-tab-pane :label="tab_item.label" :name="tab_item.name" :key="index">
              <div class="admin-page" v-if="tab_data[tab_item.name]">
                <common-form :data_list="tab_data[tab_item.name].search_list"
                  :form_data.sync="tab_data[tab_item.name].search_form" :select_data="select_data"
                  @submit-form="pageChange({ pageNum: 1, limit: tab_data[tab_item.name].page_info.limit })">
                </common-form>
                <div class="flex aic mb-main">
                  <el-button type="primary" @click="addItem({ type: tab_active })">新增应用</el-button>
                  <el-button v-if="tab_active===tab_list[0].name" class="ml-main" type="primary" @click="drawer = true">
                    应用模型配置</el-button>
                </div>
                <common-table :data="tab_data[tab_item.name].list" :props="tab_data[tab_item.name].props"
                  :page_info="tab_data[tab_item.name].page_info"
                  @edit-item="({ value, key, index }) => editItem({ type: tab_active, value, key, index })"
                  @page-change="pageChange">
                  <template #model_type="{ row, index }">
                    <el-select v-model="row.model_type"
                      @change="editItem({ type: tab_active, value: row.model_type, index, key: 'model_type' })">
                      <el-option v-for="item in text_model_type_list" :key="item.value" :label="item.value"
                        :value="item.value"></el-option>
                    </el-select>
                  </template>
                  <template #last_answer_image="{ row, index }">
                    <common-image class="image-item" fit="cover" :src="row.last_answer" width="100%" height="auto"
                      :preview_src_list="preview_image_list" :initial_index="index">
                    </common-image>
                  </template>
                  <template #test_answer="{ row }">
                    <template v-if="row.is_sending">
                      <i class="el-icon-loading"></i>
                    </template>
                    <template v-else>
                      <template v-if="tab_active==='text'">
                        <el-tooltip v-if="row.test_answer" class="item" effect="dark" placement="top">
                          <div slot="content" style="white-space: pre-line">
                            {{row.test_answer }}
                          </div>
                          <div class="text-overflow3" v-copy-text="row.test_answer" style="max-width: 100%;">
                            {{row.test_answer }}
                          </div>
                        </el-tooltip>
                      </template>
                      <template v-else-if="row.test_answer">
                        <common-image v-if="typeof row.test_answer ==='string'" class="image-item" fit="cover"
                          :src="row.test_answer" width="100%" height="auto" :preview_src_list="[row.test_answer]">
                        </common-image>
                        <el-tooltip v-else class="item" effect="dark" placement="top">
                          <div slot="content" style="white-space: pre-line">
                            {{row.test_answer }}
                          </div>
                          <div class="text-overflow3" v-copy-text="row.test_answer" style="max-width: 100%;">
                            {{row.test_answer }}
                          </div>
                        </el-tooltip>
                      </template>
                    </template>
                  </template>
                  <template #func_limit_list="{ row, index }">
                    <el-button size="mini" type="text" @click.stop="openLimitSetting({ type: tab_active, row,index })">
                      功能限制
                    </el-button>
                  </template>
                  <el-table-column label="操作" :min-width="180" fixed="right" align="center">
                    <div slot-scope="{ row,$index }">
                      <el-button v-if="['text','image'].includes(tab_active)" size="mini" type="text"
                        @click.stop="testItem({ type: tab_active, row, index:$index })">测试
                      </el-button>
                      <el-button size="mini" type="text" @click.stop="addItem({ type: tab_active, copy_data: row })">复制
                      </el-button>
                      <el-button size="mini" type="text" @click.stop="deleteItem({ index: $index, type: tab_active })">
                        删除
                      </el-button>
                    </div>
                  </el-table-column>
                </common-table>
              </div>
            </el-tab-pane>
          </template>
        </el-tabs>
      </div>
    </div>
    <el-drawer :visible.sync="drawer" :with-header="false">
      <div class="admin-page p-main">
        <div class="flex aic mb-main">
          <el-button type="primary" @click="addItem({ type: 'text_model_type_list' })">新增</el-button>
        </div>
        <common-table :data="text_model_type_list" :props="text_model_type_props"
          @edit-item="({ value, key, index }) => editItem({ type: 'text_model_type_list', value, key, index })">
          <el-table-column label="操作" :min-width="120" fixed="right" align="center">
            <div slot-scope="{ row,$index }">
              <el-button size="mini" type="text"
                @click.stop="deleteItem({ index: $index, type: 'text_model_type_list' })">删除</el-button>
            </div>
          </el-table-column>
        </common-table>
      </div>
    </el-drawer>
    <common-dialog :visible.sync="dialog" height="60vh" @confirm="limitConfirm" @close="closeSetting">
      <equity-config ref="equity_config" :edit="false" :multiple_option="multiple_option"></equity-config>
    </common-dialog>
  </div>
</template>
 
<script>
module.exports = {
  name: 'application-config',
  components: {
    'common-table': 'url:/admin/components/common/common-table.vue',
    'common-form': 'url:/admin/components/common/common-form.vue',
    'common-image': 'url:/admin/components/common/common-image.vue',
    'common-dialog': 'url:/admin/components/common/common-dialog.vue',
    'equity-config': 'url:/admin/pages/equity/equity-config.vue',
  },
  data: () => ({
    dialog: false,
    drawer: false,
    text_base_props: [
      { label: '排序', label_tooltip: '管理列表排序其他不生效', key: 'sort', min_width: 100, edit_type: 'number', fixed: 'left' },
      { label: '名称', label_tooltip: '应用名称唯一', key: 'name', min_width: 160, edit_type: 'input', fixed: 'left' },
      { label: '应用类型', label_tooltip: '普通应用可以绑定到卡片上,角色聊天会出现在角色列表', key: 'text_type', min_width: 160, edit_type: 'select', select_list: [{ value: 'text', label: '普通应用' }, { value: 'role', label: '角色聊天' },] },
      { label: '应用模型', label_tooltip: '应用模型,默认不填为yiyan', key: 'model_type', min_width: 160, slot_name: 'model_type' },
      { label: '应用说明', key: 'summary', min_width: 160, edit_type: 'input' },
      { label: '应用描述', label_tooltip: '说明较长,描述较少,描述一般为卡片副标题', key: 'description', min_width: 160, edit_type: 'input' },
      { label: '最近生成结果', key: 'last_answer', min_width: 160, copytext: true },
      { label: 'id', key: 'objectId', min_width: 200, copytext: true },
      { label: '是否禁用', label_tooltip: '禁用的配置可以在预生产预览,线上不会显示', key: 'disabled', min_width: 160, edit_type: 'boolean' },
    ],
    text_form_props: [
      { label: '占位词', key: 'placeholder', min_width: 160, edit_type: 'input' },
      { label: '最长输入', key: 'maxlength', min_width: 160, edit_type: 'number' },
      { label: 'label', key: 'label', min_width: 160, edit_type: 'input' },
      { label: '头像', label_tooltip: '角色聊天用到', key: 'avatar_url', min_width: 160, edit_type: 'image_url' },
      { label: '卡片图', label_tooltip: '角色聊天用到', key: 'cover_url', min_width: 160, edit_type: 'image_url' },
      { label: '提示词', key: 'tooltip', min_width: 160, edit_type: 'input' },
      { label: '积分图标', key: 'icon', min_width: 200, edit_type: 'image_url', },
      { label: '积分消耗文本', key: 'integration_text', min_width: 140, edit_type: 'input' },
    ],
    text_prompt_props: [
      { label: '前置指令', key: 'pre_prompt', min_width: 160, edit_type: 'textarea' },
      { label: '指令', key: 'prompt', min_width: 160, edit_type: 'textarea' },
      { label: '后置指令', key: 'tail_prompt', min_width: 160, edit_type: 'textarea' },
      { label: '测试结果', key: 'test_answer', min_width: 160, slot_name: 'test_answer' },
      { label: '招呼语', label_tooltip: '无聊天记录时显示', key: 'hello_text', min_width: 160, edit_type: 'input' },
      { label: '输入示例', label_tooltip: '逗号(,)分格,注意格式', key: 'example', min_width: 160, edit_type: 'input' },
      { label: '输出示例', label_tooltip: '逗号(,)分格,注意格式', key: 'result_example', min_width: 160, edit_type: 'input' },
    ],
    text_func_props: [
      { label: '基础积分消耗', key: 'integration', min_width: 140, edit_type: 'number' },
      { label: '方法名', label_tooltip: '用作计数', key: 'func_name', min_width: 160, edit_type: 'input' },
      { label: '方法key', label_tooltip: '用作计数', key: 'func_key', min_width: 160, edit_type: 'input' },
      { label: '功能权益', label_tooltip: '功能限制,选中之后可以设置功能限制,拥有相应权益的用户不受限制', key: 'func_limit_list', min_width: 160, slot_name: 'func_limit_list' },
      { label: '积分流水名称', key: 'action', min_width: 140, edit_type: 'relation', object_class: 'AGAction' },
      { label: '失败流水名称', key: 'error_action', min_width: 140, edit_type: 'relation', object_class: 'AGAction' },
    ],
    text_model_type_list: [],
    text_model_type_config_id: '',
    text_model_type_props: [
      { label: '排序', key: 'sort', min_width: 60, edit_type: 'number' },
      { label: '模型key', key: 'value', min_width: 160, edit_type: 'input' },
      { label: '模型name', key: 'label', min_width: 160, edit_type: 'input' },
      { label: '不可选择', key: 'disable', min_width: 160, edit_type: 'boolean' },
    ],
    text_props: [],
    image_base_props: [
      { label: '排序', label_tooltip: '管理列表排序其他不生效', key: 'sort', min_width: 100, edit_type: 'number' },
      { label: '名称', label_tooltip: '应用名称唯一', key: 'name', min_width: 160, edit_type: 'input' },
      { label: '应用类型', label_tooltip: '分文生图和图生图', key: 'image_type', min_width: 160, edit_type: 'select', select_list: [{ value: 'text2image', label: '文生图' }, { value: 'image2image', label: '图生图' },] },
      { label: '应用说明', key: 'summary', min_width: 160, edit_type: 'input' },
      { label: '应用描述', label_tooltip: '说明较长,描述较少,描述一般为卡片副标题', key: 'description', min_width: 160, edit_type: 'input' },
      { label: '最近生成结果', key: 'last_answer', min_width: 160, copytext: true, slot_name: 'last_answer_image' },
      { label: 'id', key: 'objectId', min_width: 200, copytext: true },
    ],
    image_form_props: [
      { label: '占位词', key: 'placeholder', min_width: 160, edit_type: 'input' },
      { label: '最长输入', key: 'maxlength', min_width: 160, edit_type: 'number' },
      { label: 'label', key: 'label', min_width: 160, edit_type: 'input' },
      { label: '示例图', label_tooltip: '应用内示例图', key: 'cover_url', min_width: 160, edit_type: 'image_url' },
      { label: '提示词', key: 'tooltip', min_width: 160, edit_type: 'input' },
      { label: '积分图标', key: 'icon', min_width: 200, edit_type: 'image_url', },
      { label: '积分消耗文本', key: 'integration_text', min_width: 140, edit_type: 'input' },
    ],
    image_prompt_props: [
      { label: '模型参数', key: 'image_model', min_width: 300, edit_type: 'json' },
      { label: '前置指令', key: 'pre_prompt', min_width: 160, edit_type: 'textarea' },
      { label: '指令', key: 'prompt', min_width: 160, edit_type: 'textarea' },
      { label: '后置指令', key: 'tail_prompt', min_width: 160, edit_type: 'textarea' },
      { label: '测试结果', key: 'test_answer', min_width: 160, slot_name: 'test_answer' },
      { label: '招呼语', label_tooltip: '无聊天记录时显示', key: 'hello_text', min_width: 160, edit_type: 'input' },
      { label: '输入示例', label_tooltip: '逗号(,)分格,注意格式', key: 'example', min_width: 160, edit_type: 'input' },
      { label: '输出示例', label_tooltip: '逗号(,)分格,注意格式', key: 'result_example', min_width: 160, edit_type: 'input' },
    ],
    image_func_props: [
      { label: '基础积分消耗', key: 'integration', min_width: 140, edit_type: 'number' },
      { label: '方法名', label_tooltip: '用作计数', key: 'func_name', min_width: 160, edit_type: 'input' },
      { label: '方法key', label_tooltip: '用作计数', key: 'func_key', min_width: 160, edit_type: 'input' },
      { label: '功能限制设置', label_tooltip: '获取功能限制,选中之后可以设置功能限制', key: 'func_limit_list', min_width: 160, slot_name: 'func_limit_list' },
      { label: '积分流水名称', key: 'action', min_width: 140, edit_type: 'relation', object_class: 'AGAction' },
      { label: '失败流水名称', key: 'error_action', min_width: 140, edit_type: 'relation', object_class: 'AGAction' },
    ],
    image_props: [],
    preview_image_list: [],
    page_info: {
      page_num: 1,
      limit: 10,
      total: 0
    },
    text: [],
    text_prop_type: '',
    image_prop_type: '',
    tab_active: '',
    search_form: {
      name: '',
      summary: '',
      pre_prompt: '',
      prompt: '',
      tail_prompt: '',
      text_type: ''
    },
    query_data: {
      name: 'contains',
      summary: 'contains',
      pre_prompt: 'contains',
      prompt: 'contains',
      tail_prompt: 'contains',
    },
    search_list: [
      { label: '应用名', key: 'name', type: 'input' },
      { label: '应用id', key: 'objectId', type: 'input' },
      { label: '应用类型', key: 'text_type', type: 'select' },
      { label: '应用说明', key: 'summary', type: 'input' },
      { label: '前置指令', key: 'pre_prompt', type: 'input' },
      { label: '指令', key: 'prompt', type: 'input' },
      { label: '后置指令', key: 'tail_prompt', type: 'input' },
    ],
    select_data: {
      text_type: [{ value: 'text', label: '普通应用' }, { value: 'role', label: '角色聊天' },]
    },
    prop_type_list: [{ value: '', label: '全部表头' }, { value: 'prompt', label: '指令相关' }, { value: 'form', label: '表单相关' }, { value: 'func', label: '方法相关' },],
    tab_data: {},
    tab_list: [{ name: 'text', label: '文字创作应用管理' }, { name: 'image', label: '绘图应用管理' }, { name: 'video', label: '视频应用管理' }],
    video_props: [
      { label: '排序', label_tooltip: '管理列表排序其他不生效', key: 'sort', min_width: 100, edit_type: 'number' },
      { label: '名称', label_tooltip: '应用名称唯一', key: 'name', min_width: 160, edit_type: 'input' },
      { label: '应用说明', key: 'summary', min_width: 160, edit_type: 'input' },
      { label: '应用描述', label_tooltip: '说明较长,描述较少,描述一般为卡片副标题', key: 'description', min_width: 160, edit_type: 'input' },
      { label: 'id', key: 'objectId', min_width: 200, copytext: true },
      { label: '基础积分消耗', key: 'integration', min_width: 140, edit_type: 'number' },
      { label: '方法名', label_tooltip: '用作计数', key: 'func_name', min_width: 160, edit_type: 'input' },
      { label: '方法key', label_tooltip: '用作计数', key: 'func_key', min_width: 160, edit_type: 'input' },
      { label: '功能限制设置', label_tooltip: '获取功能限制,选中之后可以设置功能限制', key: 'func_limit_list', min_width: 160, slot_name: 'func_limit_list' },
      { label: '积分流水名称', key: 'action', min_width: 140, edit_type: 'relation', object_class: 'AGAction' },
      { label: '失败流水名称', key: 'error_action', min_width: 140, edit_type: 'relation', object_class: 'AGAction' },
    ],
    current_item: {},
    current_index: 0,
    multiple_option: {
      status: true,
      select_list: [],
      auto_set: true,
      select_change: 'key'
    }
  }),
  watch: {
    tab_active(val) {
      this.getData()
        .then(res => {
          this.pageChange(this.tab_data[`${this.tab_active}`].page_info)
        })
    },
    text_prop_type: {
      handler(val) {
        switch (val) {
          case '':
            this.text_props = [
              ...this.text_base_props,
              ...this.text_prompt_props,
              ...this.text_form_props,
              ...this.text_func_props,]
            break
          case 'prompt':
            this.text_props = [
              ...this.text_base_props,
              ...this.text_prompt_props,]
            break
          case 'form':
            this.text_props = [
              ...this.text_base_props,
              ...this.text_form_props,]
            break
          case 'func':
            this.text_props = [
              ...this.text_base_props,
              ...this.text_func_props,]
            break
          default:
            break
        }
      },
      immediate: true
    },
    image_prop_type: {
      handler(val) {
        switch (val) {
          case '':
            this.image_props = [
              ...this.image_base_props,
              ...this.image_prompt_props,
              ...this.image_form_props,
              ...this.image_func_props,]
            break
          case 'prompt':
            this.image_props = [
              ...this.image_base_props,
              ...this.image_prompt_props,]
            break
          case 'form':
            this.image_props = [
              ...this.image_base_props,
              ...this.image_form_props,]
            break
          case 'func':
            this.image_props = [
              ...this.image_base_props,
              ...this.image_func_props,]
            break
          default:
            break
        }
      },
      immediate: true
    },
  },
  created() {
    this.getTextModelType()
    this.tab_active = this.tab_list[0].name
  },
  methods: {
    getData(name = this.tab_active) {
      if (!this.tab_data[`${name}`]) {
        this.$set(this.tab_data, `${name}`, {})
        this.$set(this.tab_data[`${name}`], 'list', [])
        this.$set(this.tab_data[`${name}`], 'page_info', {
          page_num: 1,
          limit: 10,
          total: 0
        })
        this.$set(this.tab_data[`${name}`], 'search_form', this.search_form)
        this.$set(this.tab_data[`${name}`], 'search_list', this.search_list)
        this.$set(this.tab_data[`${name}`], 'props', this[`${name}_props`])
      }
      return Promise.resolve()
    },
    getTextModelType() {
      lc.read('AGConfig', (q) => {
        q.equalTo('type', 'text_model_type')
        q.limit(1)
      })
        .then(([res]) => {
          if (!res) throw '配置获取失败'
          let config_data = res.get('config_data')
          this.text_model_type_config_id = res.id
          this.$set(this, 'text_model_type_list', config_data.data)
        })
        .catch(err => {
          throw err
        })
    },
    pageChange({ page_num = 1, limit = 10 } = {}, name = this.tab_active) {
      this.tab_data[`${name}`].page_info.page_num = page_num
      this.tab_data[`${name}`].page_info.limit = limit
      this.$loading()
      lc.readTotal('KSApplication', (q) => {
        q = this.$setQuery(q, this.search_form, this.query_data)
        q.equalTo('type', this.tab_active)
        q.notEqualTo('name', '基础应用')
        q.equalTo('user', lc.createObject('_User', this.$config.master_user_id))
        q.include('action')
        q.include('error_action')
        q.include('func_limit_list')
        q.limit(limit)
        q.skip(limit * (page_num - 1))
        q.ascending('sort')
        q.addDescending('createdAt')
      })
        .then(res => {
          let { data, count } = res
          this.tab_data[`${name}`].page_info.total = count
          this.$set(this.tab_data[`${name}`], 'list', data.map(i => {
            let item = i.toJSON()
            item.action_id = item.action && item.action.objectId
            item.action_list = (item.action && [item.action]) || []
            item.error_action_id = item.error_action && item.error_action.objectId
            item.error_action_list = (item.error_action && [item.error_action]) || []
            return item
          }))
          if (name === 'image') {
            this.preview_image_list = data.map(i => i.get('last_answer'))
          }
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
        case 'write':
        case 'text':
        case 'image':
        case 'video':
          class_data = {
            class_name: 'KSApplication',
            only_key_list: ['name']
          }
          if (copy_data && copy_data.objectId) {
            request = lc.run('copyClassData', {
              ...class_data,
              id: copy_data.objectId
            })
          } else {
            data = {
              "name": (new Date().getTime()) + '',
              "description": "新应用",
              "type": type,
              "sort": 0,
              "integration": 0,
              "integration_text": '限免中',
              "icon": "https://aigeek-1258317412.cos.ap-beijing.myqcloud.com/mobile/icon/icon-integral.png",
              prompt: '',
              summary: '新应用',
              base_app: lc.createObject('KSApplication', this.$config.base_app_id),
              user: lc.createObject('_User', this.$config.master_user_id),
              action: lc.createObject('AGAction', this.$config.base_text_action_id),
              error_action: lc.createObject('AGAction', this.$config.base_text_error_action_id),
            }
            request = lc.create(class_data.class_name, data)
          }
          request
            .then(() => {
              this.pageChange({ page_num: 1, limit: this.tab_data[`${this.tab_active}`].page_info.limit })
            })
            .catch(err => {
              console.log(err)
              this.$alert(err)
            })
          break
        case 'text_model_type_list':
          this.text_model_type_list.push({
            value: ''
          })
          this.editItem({ type })
          break
        default:
          break
      }
    },
    editItem({ type, key, index, value }) {
      let lc_object
      let data
      switch (type) {
        case 'image':
        case 'text':
        case 'video':
          data = {
            [key]: value
          }
          switch (key) {
            case 'model_type':
              data.model_name = this.text_model_type_list.find(item => item.value === value).label
              break
            default:
              break
          }
          lc.update('KSApplication', this.tab_data[this.tab_active].list[index].objectId, data)
            .then(res => {
              this.pageChange(this.tab_data[`${this.tab_active}`].page_info)
              this.$toast('更改成功,刷新后查看变更')
            })
            .catch(err => {
              console.log(err)
              this.$alert(err)
            })
          break
        case 'text_model_type_list':
          switch (key) {
            case 'sort':
              this[type].sort((a, b) => {
                return (+a[key] || 0) - (+b[key] || 0)
              })
              break
            default:
              break
          }
          lc_object = lc.createObject('AGConfig', this.text_model_type_config_id)
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
          break
      }
    },
    deleteItem({ index, type }) {
      this.$confirm('确认删除？')
        .then(() => {
          switch (type) {
            case 'video':
            case 'image':
            case 'text':
              let id = this.tab_data[this.tab_active].list[index].objectId
              lc.delete('KSApplication', id)
                .then(() => {
                  this.pageChange(this.tab_data[`${this.tab_active}`].page_info)
                })
                .catch(err => {
                  console.log(err)
                  this.$alert(err)
                })
              break
            case 'text_model_type_list':
              this.text_model_type_list.splice(index, 1)
              this.editItem({ type })
              break
            default:
              break
          }
        })
    },
    testItem({ type, row, index }) {
      if (row.is_sending) return
      this.$prompt('', '测试应用', {
        inputValue: row.prompt,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(({ value }) => {
        this.$set(this.tab_data[type].list[index], 'is_sending', true)
        let prompt = (row.pre_prompt || '') + (value || row.prompt || '') + (row.tail_prompt || '')
        switch (type) {
          case 'text':
            lc.run('applicationChatTest', {
              user_input: value,
              messages: [{
                role: 'user',
                content: prompt
              }],
              application_id: row.objectId,
              model_type: row.model_type || 'yiyan'
            }, { history: false })
              .then((res) => {
                this.queryResult(res.data.objectId, index, type)
              })
              .catch((error) => {
                this.$alert(error)
              })
            break
          case 'image':
            lc.run('imageLeonardo', {
              prompt: prompt,
              prompt_cn: prompt,
              modelId: row.image_model.id,
              width: 768,
              height: 1024,
              application_id: row.objectId,
              ...row.image_model.params,
            }, { history: false })
              .then((res) => {
                this.queryResult(res.data.objectId, index, type)
              })
              .catch((error) => {
                this.$alert(error)
              })
            break
          default:
            break
        }
      })
        .catch(err => {
          err.rawMessage && this.$alert(err)
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
    queryResult(id, index, type) {
      switch (type) {
        case 'text':
          this.queryItemResult({ classs: 'KSApplicationChatTest', id })
            .then(res => {
              console.log(res)
              let data = res.toJSON()
              switch (data.status) {
                case 1:
                  let answer = data.answer
                  this.$set(this.tab_data[type].list[index], 'test_answer', answer)
                  break
                case -1:
                  this.$set(this.tab_data[type].list[index], 'test_answer', data.output.msg)
                  break
                default:
                  break
              }
            })
            .catch(error => {
              this.$alert(error)
            })
            .finally(() => {
              this.$set(this.tab_data[type].list[index], 'is_sending', false)
            })
          break
        case 'image':
          this.queryItemResult({ classs: 'KSImage', id })
            .then(res => {
              console.log(res)
              let data = res.toJSON()
              switch (data.status) {
                case 1:
                  let answer = data.output.url
                  this.$set(this.tab_data[type].list[index], 'test_answer', answer)
                  break
                case -1:
                  this.$set(this.tab_data[type].list[index], 'test_answer', data.error)
                  break
                default:
                  break
              }
            })
            .catch(error => {
              this.$alert(error)
            })
            .finally(() => {
              this.$set(this.tab_data[type].list[index], 'is_sending', false)
            })
          break
        default:
          break
      }

    },
    getAction({ row, index, query, type }) {
      row.loading = true
      lc.readTotal('AGAction', (q) => {
        q.contains('name', query)
      })
        .then(res => {
          let { data, count } = res
          row[type] = data.map(i => i.toJSON())
          row.loading = false
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
          row.loading = false
        })
    },
    changeAction({ value, key, type, index }) {
      let action = lc.createObject('AGAction', value)
      this.editItem({ value: action, key, type, index })
    },
    closeSetting() {
      this.multiple_option.select_list = []
    },
    openLimitSetting({ type, index, row }) {
      this.current_item = row
      this.current_index = index
      this.current_type = type
      this.multiple_option.select_list = row.func_limit_list || []
      this.dialog = true
    },
    limitConfirm() {
      let list = Array.from(this.$refs.equity_config.getMultipleSelection())
      let func_limit_list = list.map(i => lc.createObject('KSFunctionalLimitations', i))
      this.closeSetting()
      this.editItem({ type: this.tab_active, value: func_limit_list, key: 'func_limit_list', index: this.current_index })
    }
  },
}
</script>
 
<style scoped>
.tabs-container {
  width: 100%;
  height: 100%;
}

.preview-page {
  min-width: 385px;
  width: 385px;
  height: 812px;
}
</style>