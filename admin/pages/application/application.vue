<template>
  <div class="admin-page">
    <div class="w-100 h-100 flex">
      <div class="mr-main tabs-container flex-c">
        <el-tabs v-model="tab_active">
          <el-tab-pane label="模型体验" name="experience_list">
            <div class="admin-page">
              <div class="flex mb-main">
                <el-button type="primary" @click="addItem('experience_list')">新增</el-button>
              </div>
              <common-table :data="experience_list" :props="props_experience_list" :all_page="true">
                <template #sort="{ row }">
                  <el-input v-model="row.sort"
                    @keyup.enter.native="editItem({ type: 'experience_list', key: 'sort' },)"></el-input>
                </template>
                <template #title="{ row }">
                  <el-input v-model="row.title" @keyup.enter.native="editItem({ type: 'experience_list' })"></el-input>
                </template>
                <template #url="{ row }">
                  <el-input v-model="row.url" @keyup.enter.native="editItem({ type: 'experience_list' })"></el-input>
                </template>
                <template #icon="{ row }">
                  <common-upload :url.sync="row.icon" @change="editItem({ type: 'experience_list' })"></common-upload>
                </template>
                <template #tag="{ row }">
                  <common-upload :url.sync="row.tag" @change="editItem({ type: 'experience_list' })"></common-upload>
                </template>
                <el-table-column label="操作" min-width="120" fixed="right" align="center">
                  <div slot-scope="{ row ,$index}">
                    <el-button size="mini" type="text" @click.stop="addItem('experience_list', row)">复制</el-button>
                    <el-button size="mini" type="text" @click.stop="deleteItem($index, 'experience_list')">删除</el-button>
                  </div>
                </el-table-column>
              </common-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="官网模型体验" name="web_experience_list">
            <div class="admin-page">
              <div class="flex mb-main">
                <el-button type="primary" @click="addItem('web_experience_list')">新增</el-button>
              </div>
              <common-table :data="web_experience_list" :props="props_web_experience_list" :all_page="true">
                <template #sort="{ row, index }">
                  <el-input v-model="row.sort"
                    @keyup.enter.native="editItem({ type: 'web_experience_list', key: 'sort' },)"></el-input>
                </template>
                <template #title="{ row }">
                  <el-input v-model="row.title"
                    @keyup.enter.native="editItem({ type: 'web_experience_list' })"></el-input>
                </template>
                <template #lc_fun="{ row }">
                  <el-input v-model="row.lc_fun"
                    @keyup.enter.native="editItem({ type: 'web_experience_list' })"></el-input>
                </template>
                <template #func_name="{ row }">
                  <el-input v-model="row.func_name"
                    @keyup.enter.native="editItem({ type: 'web_experience_list' })"></el-input>
                </template>
                <template #func_key="{ row }">
                  <el-input v-model="row.func_key"
                    @keyup.enter.native="editItem({ type: 'web_experience_list' })"></el-input>
                </template>
                <template #avatar="{ row }">
                  <common-upload :url.sync="row.avatar"
                    @change="editItem({ type: 'web_experience_list' })"></common-upload>
                </template>
                <template #avatar_select="{ row }">
                  <common-upload :url.sync="row.avatar_select"
                    @change="editItem({ type: 'web_experience_list' })"></common-upload>
                </template>
                <template #role_id="{ row, index }">
                  <el-select v-model="row.role_id" remote filterable :default-first-option="true"
                    :remote-method="(query) => getRole({ row, index, query, type: 'web_experience_list' })"
                    :loading="row.loading" @change="editItem({ type: 'web_experience_list' })">
                    <el-option v-for="item in row.role_list" :key="item.objectId" :label="item.name"
                      :value="item.objectId"></el-option>
                  </el-select>
                </template>
                <el-table-column label="操作" min-width="120" fixed="right" align="center">
                  <div slot-scope="{ row ,$index}">
                    <el-button size="mini" type="text" @click.stop="addItem('web_experience_list', row)">复制</el-button>
                    <el-button size="mini" type="text"
                      @click.stop="deleteItem($index, 'web_experience_list')">删除</el-button>
                  </div>
                </el-table-column>
              </common-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="文案内容创作" name="text_list">
            <div class="admin-page">
              <div class="flex mb-main">
                <el-button type="primary" @click="addItem('text_list')">新增</el-button>
              </div>
              <common-table :data="text_list" :props="props_text_list" :all_page="true">
                <template #sort="{ row }">
                  <el-input v-model="row.sort"
                    @keyup.enter.native="editItem({ type: 'text_list', key: 'sort' })"></el-input>
                </template>
                <template #description="{ row }">
                  <el-input v-model="row.description" :autosize="true"
                    @keyup.enter.native="editItem({ type: 'text_list' })"></el-input>
                </template>
                <template #title="{ row }">
                  <el-input v-model="row.title" @keyup.enter.native="editItem({ type: 'text_list' })"></el-input>
                </template>
                <template #type="{ row }">
                  <el-select v-model="row.type" placeholder="跳转类型" @change="editItem({ type: 'text_list' })">
                    <el-option v-for="item in type_list" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </template>
                <template #application="{ row, index }">
                  <el-select v-model="row.config_application_id" remote filterable :disabled="row.type !== 'application'"
                    :default-first-option="true"
                    :remote-method="(query) => getRelation({ row, index, query, type: 'application_list' })"
                    :loading="row.loading" @change="editItem({ type: 'text_list' })">
                    <el-option v-for="item in row.application_list" :key="item.objectId" :label="item.name"
                      :value="item.objectId"></el-option>
                  </el-select>
                </template>
                <template #func_name="{ row }">
                  <el-input v-model="row.func_name" @keyup.enter.native="editItem({ type: 'text_list' })"></el-input>
                </template>
                <template #key="{ row }">
                  <el-input v-model="row.key" @keyup.enter.native="editItem({ type: 'text_list' })"></el-input>
                </template>
                <template #url="{ row }">
                  <el-input v-model="row.url" @keyup.enter.native="editItem({ type: 'text_list' })"></el-input>
                </template>
                <template #web_url="{ row }">
                  <el-input v-model="row.web_url" @keyup.enter.native="editItem({ type: 'text_list' })"></el-input>
                </template>
                <template #bg="{ row }">
                  <common-upload :url.sync="row.bg" @change="editItem({ type: 'text_list' })"></common-upload>
                </template>
                <template #icon="{ row }">
                  <common-upload :url.sync="row.icon" @change="editItem({ type: 'text_list' })"></common-upload>
                </template>
                <template #tag="{ row }">
                  <common-upload :url.sync="row.tag" @change="editItem({ type: 'text_list' })"></common-upload>
                </template>
                <el-table-column label="操作" :min-width="120" fixed="right" align="center">
                  <div slot-scope="{ row ,$index}">
                    <el-button size="mini" type="text" @click.stop="addItem('text_list', row)">复制</el-button>
                    <el-button size="mini" type="text" @click.stop="deleteItem($index, 'text_list')">删除</el-button>
                  </div>
                </el-table-column>
              </common-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="热门" name="hot_list">
            <div class="admin-page">
              <div class="flex mb-main">
                <el-button type="primary" @click="addItem('hot_list')">新增</el-button>
              </div>
              <common-table :data="hot_list" :props="props_hot_list" :all_page="true">
                <template #sort="{ row }">
                  <el-input v-model="row.sort"
                    @keyup.enter.native="editItem({ type: 'hot_list', key: 'sort' },)"></el-input>
                </template>
                <template #title="{ row }">
                  <el-input v-model="row.title" @keyup.enter.native="editItem({ type: 'hot_list' })"></el-input>
                </template>
                <template #description="{ row }">
                  <el-input v-model="row.description" @keyup.enter.native="editItem({ type: 'hot_list', })"></el-input>
                </template>
                <template #func_name="{ row }">
                  <el-input v-model="row.func_name" @keyup.enter.native="editItem({ type: 'hot_list' })"></el-input>
                </template>
                <template #key="{ row }">
                  <el-input v-model="row.key" @keyup.enter.native="editItem({ type: 'hot_list' })"></el-input>
                </template>
                <template #type="{ row, index }">
                  <el-select v-model="row.type" placeholder="跳转类型"
                    @change="editItem({ type: 'hot_list', key: 'type', index })">
                    <el-option v-for="item in type_list" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </template>
                <template #url="{ row }">
                  <el-input v-model="row.url" @keyup.enter.native="editItem({ type: 'hot_list' })"></el-input>
                </template>
                <template #web_url="{ row }">
                  <el-input v-model="row.web_url" @keyup.enter.native="editItem({ type: 'hot_list' })"></el-input>
                </template>
                <template #bg="{ row }">
                  <common-upload :url.sync="row.bg" @change="editItem({ type: 'hot_list' })"></common-upload>
                </template>
                <template #tag="{ row }">
                  <common-upload :url.sync="row.tag" @change="editItem({ type: 'hot_list' })"></common-upload>
                </template>
                <template #button_icon="{ row }">
                  <common-upload :url.sync="row.button_icon" @change="editItem({ type: 'hot_list' })"></common-upload>
                </template>
                <el-table-column label="操作" min-width="120" fixed="right" align="center">
                  <div slot-scope="{ row ,$index}">
                    <el-button size="mini" type="text" @click.stop="addItem('hot_list', row)">复制</el-button>
                    <el-button size="mini" type="text" @click.stop="deleteItem($index, 'hot_list')">删除</el-button>
                  </div>
                </el-table-column>
              </common-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="绘画" name="image_list">
            <div class="admin-page">
              <div class="flex mb-main">
                <el-button type="primary" @click="addItem('image_list')">新增</el-button>
              </div>
              <common-table :data="image_list" :props="props_image_list" :all_page="true">
                <template #sort="{ row, index }">
                  <el-input v-model="row.sort"
                    @keyup.enter.native="editItem({ type: 'image_list', key: 'sort' },)"></el-input>
                </template>
                <template #title="{ row }">
                  <el-input v-model="row.title" @keyup.enter.native="editItem({ type: 'image_list' })"></el-input>
                </template>
                <template #description="{ row }">
                  <el-input v-model="row.description" @keyup.enter.native="editItem({ type: 'image_list', })"></el-input>
                </template>
                <template #func_name="{ row }">
                  <el-input v-model="row.func_name" @keyup.enter.native="editItem({ type: 'image_list' })"></el-input>
                </template>
                <template #sub_func_name="{ row }">
                  <el-input v-model="row.sub_func_name" @keyup.enter.native="editItem({ type: 'image_list' })"></el-input>
                </template>
                <template #key="{ row }">
                  <el-input v-model="row.key" @keyup.enter.native="editItem({ type: 'image_list' })"></el-input>
                </template>
                <template #type="{ row, index }">
                  <el-select v-model="row.type" placeholder="跳转类型"
                    @change="editItem({ type: 'image_list', key: 'type', index })">
                    <el-option v-for="item in type_list" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </template>
                <template #url="{ row }">
                  <el-input v-model="row.url" @keyup.enter.native="editItem({ type: 'image_list' })"></el-input>
                </template>
                <template #web_url="{ row }">
                  <el-input v-model="row.web_url" @keyup.enter.native="editItem({ type: 'image_list' })"></el-input>
                </template>
                <template #bg="{ row }">
                  <common-upload :url.sync="row.bg" @change="editItem({ type: 'image_list' })"></common-upload>
                </template>
                <template #tag="{ row }">
                  <common-upload :url.sync="row.tag" @change="editItem({ type: 'image_list' })"></common-upload>
                </template>
                <template #button_icon="{ row }">
                  <common-upload :url.sync="row.button_icon" @change="editItem({ type: 'image_list' })"></common-upload>
                </template>
                <el-table-column label="操作" min-width="120" fixed="right" align="center">
                  <div slot-scope="{ row ,$index}">
                    <el-button size="mini" type="text" @click.stop="addItem('hot_list', row)">复制</el-button>
                    <el-button size="mini" type="text" @click.stop="deleteItem($index, 'image_list')">删除</el-button>
                  </div>
                </el-table-column>
              </common-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="preview-page">
        <preview :url="preview_url"></preview>
      </div>
    </div>
  </div>
</template>
 
<script>
module.exports = {
  name: 'application',
  components: {
    'preview': 'url:/admin/components/preview.vue',
    'common-table': 'url:/admin/components/common/common-table.vue',
    'common-upload': 'url:/admin/components/common/common-upload.vue',
  },
  data: () => ({
    preview_url: window.util.platform.is_dev ? 'https://m-dev-1258317412.cos-website.ap-beijing.myqcloud.com' : 'https://m.kvker.com',
    tab_list: [{ label: '', name: '' }],
    props_hot_list: [
      { label: '排序', key: 'sort', min_width: 80, slot_name: 'sort' },
      { label: '名称', key: 'title', min_width: 160, slot_name: 'title' },
      { label: '描述', key: 'description', min_width: 200, slot_name: 'description', },
      { label: '方法名(用作计数)', key: 'func_name', min_width: 160, slot_name: 'func_name' },
      { label: '方法Key(用作计数)', key: 'key', min_width: 160, slot_name: 'key' },
      { label: '跳转类型', key: 'type', min_width: 160, slot_name: 'type' },
      { label: '路径', key: 'url', min_width: 300, slot_name: 'url' },
      { label: 'web路径', key: 'web_url', min_width: 350, slot_name: 'web_url', },
      { label: '背景图', key: 'bg', min_width: 160, slot_name: 'bg' },
      { label: 'tag', key: 'tag', min_width: 160, slot_name: 'tag' },
      { label: '按钮图标', key: 'button_icon', min_width: 160, slot_name: 'button_icon' },
    ],
    props_image_list: [
      { label: '排序', key: 'sort', min_width: 80, slot_name: 'sort' },
      { label: '名称', key: 'title', min_width: 160, slot_name: 'title' },
      { label: '描述', key: 'description', min_width: 200, slot_name: 'description', },
      { label: '方法名(用作计数)', key: 'func_name', min_width: 160, slot_name: 'func_name' },
      { label: '第二方法名(用作计数)', key: 'sub_func_name', min_width: 160, slot_name: 'sub_func_name' },
      { label: '方法Key(用作计数)', key: 'key', min_width: 160, slot_name: 'key' },
      { label: '跳转类型', key: 'type', min_width: 160, slot_name: 'type' },
      { label: '路径', key: 'url', min_width: 300, slot_name: 'url' },
      { label: 'web路径', key: 'web_url', min_width: 350, slot_name: 'web_url', },
      { label: '背景图', key: 'bg', min_width: 160, slot_name: 'bg' },
      { label: 'tag', key: 'tag', min_width: 160, slot_name: 'tag' },
      { label: '按钮图标', key: 'button_icon', min_width: 160, slot_name: 'button_icon' },
    ],
    props_text_list: [
      { label: '排序', key: 'sort', min_width: 80, slot_name: 'sort' },
      { label: '名称', key: 'title', min_width: 160, slot_name: 'title' },
      { label: '描述', key: 'description', min_width: 200, slot_name: 'description' },
      { label: '关联应用配置', key: 'application', min_width: 200, slot_name: 'application' },
      { label: '方法名(用作计数)', key: 'func_name', min_width: 160, slot_name: 'func_name' },
      { label: '方法Key(用作计数)', key: 'key', min_width: 160, slot_name: 'key' },
      { label: '跳转类型', key: 'type', min_width: 160, slot_name: 'type' },
      { label: '路径', key: 'url', min_width: 300, slot_name: 'url' },
      { label: 'web路径', key: 'web_url', min_width: 350, slot_name: 'web_url', },
      { label: '背景图', key: 'bg', min_width: 160, slot_name: 'bg' },
      { label: 'icon', key: 'icon', min_width: 160, slot_name: 'icon' },
      { label: 'tag', key: 'tag', min_width: 160, slot_name: 'tag' },
    ],
    props_experience_list: [
      { label: '排序', key: 'sort', min_width: 80, slot_name: 'sort' },
      { label: '名称', key: 'title', min_width: 160, slot_name: 'title' },
      { label: '路径', key: 'url', min_width: 300, slot_name: 'url' },
      { label: 'icon', key: 'icon', min_width: 160, slot_name: 'icon' },
      { label: 'tag', key: 'tag', min_width: 160, slot_name: 'tag' },
    ],
    props_web_experience_list: [
      { label: '排序', key: 'sort', min_width: 80, slot_name: 'sort' },
      { label: '名称', key: 'title', min_width: 160, slot_name: 'title' },
      { label: '云函数', key: 'lc_fun', min_width: 160, slot_name: 'lc_fun' },
      { label: '方法', key: 'func_name', min_width: 160, slot_name: 'func_name' },
      { label: '方法key', key: 'func_key', min_width: 160, slot_name: 'func_key' },
      { label: '头像', key: 'avatar', min_width: 160, slot_name: 'avatar' },
      { label: '角色', key: 'role_id', min_width: 160, slot_name: 'role_id' },
    ],
    web_experience_list: [],
    experience_list: [],
    hot_list: [],
    text_list: [],
    page_info: {
      page_num: 1,
      limit: 10,
      total: 0
    },
    text_chat_list: [],
    image_list: [],
    count_data: {},
    tab_active: 'text_list',
    item_id: '',
    search_title: '',
    type_list: [{ value: '', label: '默认' }, { value: 'H5', label: 'H5' }, { value: 'chatWrite', label: '文案chat' }, { value: 'application', label: 'application设置' }],
    model_type_list: [{ value: 'openai', label: 'openai' }, { value: 'yiyan', label: '文心一言' },]
  }),
  created() {
    this.getApplicationConfig()
  },
  methods: {
    // 获取设置
    getApplicationConfig() {
      let class_name = util.platform.is_dev ? 'AGConfigDev' : 'AGConfig'
      return lc.read(class_name, (q) => {
        q.equalTo('platform', 'mobile')
        q.equalTo('type', 'index_config')
        q.limit(1)
      })
        .then(([res]) => {
          if (!res) throw '配置获取失败'
          this.item_id = res.id
          let config_data = res.get('config_data')
          return config_data
        })
        .then((res) => {
          let key_list = ['hot_list', 'text_list', 'image_list', 'experience_list', 'web_experience_list']
          for (let key of key_list) {
            let data = res[key]
            switch (key) {
              case 'web_experience_list':
                data.forEach(i => {
                  this.getItemRoleList(i, i.role_id)
                })
                break
              case 'text_list':
                data.forEach(i => {
                  this.getItemRelation(i, i.config_application_id)
                })
                break
              default:
                break
            }
            this.$set(this, key, data)
          }
          console.log('image_list', this.image_list)
          console.log('hot_list', this.hot_list)
        })
        .catch(err => {
          throw err
        })
    },
    pageChange({ page_num = 1, limit = 10 } = {}) {
      this.page_info.page_num = page_num
      this.page_info.limit = limit
      lc.readTotal('KSChatWriteRole', (q) => {
        if (this.search_title) q.contains('title', this.search_title)
        q.ascending('sort')
        q.limit(limit)
        q.skip(limit * (page_num - 1))
      })
        .then(res => {
          let { data, count } = res
          this.page_info.total = count
          if (!data.length && this.search_title) throw { rawMessage: '查询失败' }
          this.text_chat_list = data.map(i => {
            let item = i.toJSON()
            let key_list = ['sort', 'title', 'description', 'func_name', 'key', 'bg', 'icon', 'tag', 'type', 'url', 'web_url']
            let data = {}
            for (let key of key_list) {
              data[key] = item[key]
            }
            return data
          })
          console.log(this.text_chat_list)
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
        })
    },
    addItem(type, copy_data) {
      let data = {}
      switch (type) {
        case 'experience_list':
          this.experience_list.push(copy_data || {
            title: '',
            url: '',
            icon: '',
            tag: '',
            sort: 0,
          })
          this.editItem({ type, key: 'sort' })
          break
        case 'web_experience_list':
          this.web_experience_list.push(copy_data || {
            title: '',
            avatar: '',
            sort: 0,
            role_list: []
          })
          this.editItem({ type, key: 'sort' })
          break
        case 'text_list':
          this.text_list.push(copy_data || {
            title: '',
            url: '',
            icon: '',
            tag: '',
            description: '',
            type: '',
            sort: 0,
          })
          this.editItem({ type, key: 'sort' })
          break
        case 'hot_list':
          this.hot_list.push({
            title: '',
            bg: '',
            button_icon: '',
            tag: '',
            type: '',
            sort: 0,
          })
          this.editItem({ type, key: 'sort' })
          break
        case 'image_list':
          this.image_list.push({
            title: '',
            bg: '',
            tag: '',
            button_icon: '',
            type: '',
            sort: 0,
          })
          this.editItem({ type, key: 'sort' })
          break
      }
    },
    editItem({ type, key, index }) {
      let classs = util.platform.is_dev ? 'AGConfigDev' : 'AGConfig'
      let lc_object
      switch (type) {
        case 'text_chat_list':
          lc.update('KSChatWriteRole', this.text_chat_list[index].objectId, { [key]: this.text_chat_list[index][key] })
            .then(res => {
              this.pageChange(this.page_info)
              this.$toast('更改成功,刷新后查看变更')
            })
            .catch(err => {
              console.log(err)
              this.$alert(err)
            })
          break
        default:
          lc_object = lc.createObject(classs, this.item_id)
          switch (key) {
            case 'sort':
              this[type].sort((a, b) => {
                return (+a[key]) - (+b[key])
              })
              break
            default:
              break
          }
          lc_object.set(`config_data.${type}`, this[type])
          lc_object.save()
            .then(() => {
              this.$toast('更改成功,刷新后查看变更')
            })
            .catch(err => {
              console.log(err)
              this.$alert(err)
            })
          break
      }
    },
    deleteItem(index, type) {
      this.$confirm('确认删除？')
        .then(() => {
          switch (type) {
            case 'text_chat_list':
              let id = this.text_chat_list[index].objectId
              lc.delete('KSChatWriteRole', id)
                .then(() => {
                  this.pageChange(this.page_info)
                })
                .catch(err => {
                  console.log(err)
                  this.$alert(err)
                })
              break
            default:
              this[type].splice(index, 1)
              this.editItem({ type })
              break
          }
        })
    },
    getRole({ row, index, query, type }) {
      row.loading = true
      lc.readTotal('KSChatRole', (q) => {
        q.contains('name', query)
      })
        .then(res => {
          let { data, count } = res
          row.role_list = data.map(i => i.toJSON())
          row.loading = false
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
          row.loading = false
        })
    },
    getItemRoleList(row, id) {
      if (!id) {
        row.role_list = []
      } else {
        lc.read('KSChatRole', (q) => {
          q.equalTo('objectId', id)
        })
          .then(res => {
            row.role_list = res.map(i => i.toJSON())
          })
          .catch(err => {
            console.log(err)
          })
      }
    },
    getItemRelation(row, id) {
      if (!id) {
        row.application_list = []
      } else {
        lc.read('KSApplicationChatConfig', (q) => {
          q.equalTo('objectId', id)
        })
          .then(res => {
            row.application_list = res.map(i => i.toJSON())
          })
          .catch(err => {
            console.log(err)
          })
      }
    },
    getRelation({ row, index, query, type }) {
      row.loading = true
      lc.readTotal('KSApplicationChatConfig', (q) => {
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
  },
}
</script>
 
<style scoped>
.tabs-container {
  height: 100%;
  width: calc(100% - 401px);
}

.preview-page {
  min-width: 385px;
  width: 385px;
  height: 812px;
}
</style>