<template>
  <div class="admin-page">
    <el-tabs v-model="tab_active">
      <el-tab-pane label="菜单管理" name="menu">
        <div class="admin-page">
          <div class="mb-main">
            <el-button type="primary" :disabled="config_data.length >= 3" @click="addItem(-1)">新增菜单</el-button>
            <el-button type="primary" @click="saveMenu">保存菜单</el-button>
          </div>
          <el-table :data="config_data" border>
            <el-table-column prop="name" min-width="80" label="排序">
              <div slot-scope="{ row , $index}">
                <el-input v-model="row.sort"
                  @keyup.enter.native="editItem({ row, index: $index, sub_index: -1, key: 'sort' })"></el-input>
              </div>
            </el-table-column>
            <el-table-column prop="name" min-width="100" label="菜单名称">
              <div slot-scope="{ row , $index}">
                <el-input v-model="row.name" @keyup.enter.native="editItem({ row, key: 'name' })"></el-input>
              </div>
            </el-table-column>
            <el-table-column prop="type" min-width="140" label="菜单类型">
              <div slot-scope="{ row , $index}">
                <el-select v-model="row.type" :disabled="row.sub_button" placeholder=""
                  @change="editItem({ row, key: 'type' })">
                  <el-option v-for="item in type_list" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </div>
            </el-table-column>
            <el-table-column prop="url" min-width="100" label="菜单链接">
              <div slot-scope="{ row , $index}">
                <el-input v-model="row.url" :disabled="row.sub_button"
                  @keyup.enter.native="editItem({ row, key: 'url' })"></el-input>
              </div>
            </el-table-column>
            <el-table-column prop="key" min-width="100" label="菜单key">
              <div slot-scope="{ row , $index}">
                <el-input v-model="row.key" :disabled="row.sub_button"
                  @keyup.enter.native="editItem({ row, key: 'key' })"></el-input>
              </div>
            </el-table-column>
            <el-table-column prop="pagepath" min-width="100" label="小程序路径">
              <div slot-scope="{ row , $index}">
                <el-input v-model="row.pagepath" :disabled="row.sub_button"
                  @keyup.enter.native="editItem({ row, key: 'pagepath' })"></el-input>
              </div>
            </el-table-column>
            <el-table-column prop="appid" min-width="100" label="小程序appid">
              <div slot-scope="{ row , $index}">
                <el-input v-model="row.appid" :disabled="row.sub_button"
                  @keyup.enter.native="editItem({ row, key: 'appid' })"></el-input>
              </div>
            </el-table-column>
            <el-table-column label="子菜单" min-width="700">
              <template slot-scope="scope">
                <div class="flex-c">
                  <div class="mb-half">
                    <el-button type="primary" :disabled="scope.row.sub_button && scope.row.sub_button.length >= 5"
                      @click="addItem(scope.$index)">新增子菜单</el-button>
                  </div>
                  <el-table :data="scope.row.sub_button" border>
                    <el-table-column prop="name" min-width="80" label="排序">
                      <div slot-scope="{ row , $index}">
                        <el-input v-model="row.sort"
                          @keyup.enter.native="editItem({ row, index: scope.$index, sub_index: $index, key: 'sort' })"></el-input>
                      </div>
                    </el-table-column>
                    <el-table-column prop="name" min-width="100" label="菜单名称">
                      <div slot-scope="{ row , $index}">
                        <el-input v-model="row.name" @keyup.enter.native="editItem({ row, key: 'name' })"></el-input>
                      </div>
                    </el-table-column>
                    <el-table-column prop="type" min-width="140" label="菜单类型">
                      <div slot-scope="{ row , $index}">
                        <el-select v-model="row.type" @change="editItem({ row, key: 'type' })">
                          <el-option v-for="item in type_list" :key="item.value" :label="item.label" :value="item.value">
                          </el-option>
                        </el-select>
                      </div>
                    </el-table-column>
                    <el-table-column prop="url" min-width="100" label="菜单链接">
                      <div slot-scope="{ row , $index}">
                        <el-input v-model="row.url" @keyup.enter.native="editItem({ row, key: 'url' })"></el-input>
                      </div>
                    </el-table-column>
                    <el-table-column prop="key" min-width="100" label="菜单key">
                      <div slot-scope="{ row , $index}">
                        <el-input v-model="row.key" @keyup.enter.native="editItem({ row, key: 'key' })"></el-input>
                      </div>
                    </el-table-column>
                    <el-table-column prop="pagepath" min-width="100" label="小程序路径">
                      <div slot-scope="{ row , $index}">
                        <el-input v-model="row.pagepath"
                          @keyup.enter.native="editItem({ row, key: 'pagepath' })"></el-input>
                      </div>
                    </el-table-column>
                    <el-table-column prop="appid" min-width="100" label="小程序appid">
                      <div slot-scope="{ row , $index}">
                        <el-input v-model="row.appid" @keyup.enter.native="editItem({ row, key: 'appid' })"></el-input>
                      </div>
                    </el-table-column>
                    <el-table-column label="操作" min-width="50" fixed="right" align="center">
                      <div slot-scope="{ row, $index }">
                        <el-button size="mini" type="text"
                          @click.stop="deleteItem({ row, index: scope.$index, sub_index: $index })">删除</el-button>
                      </div>
                    </el-table-column>
                  </el-table>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="50" fixed="right" align="center">
              <div slot-scope="{ row,$index }">
                <el-button size="mini" type="text"
                  @click.stop="deleteItem({ row, index: $index, sub_index: -1 })">删除</el-button>
              </div>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane label="素材管理" name="material">
        <div class="admin-page">
          <el-tabs type="border-card">
            <el-tab-pane label="图片素材">
              <div class="admin-page">
                <common-table :data="table_data" :props="props" :page_info="page_info" @page-change="pageChange"
                  :page_config="{
                    page_size_list: [10, 20]
                  }">
                  <template #image="{ row }">
                    <el-image class="image-item" fit="cover" :src="row.url" :preview-src-list="[row.url]">
                    </el-image>
                  </template>
                </common-table>
              </div>
            </el-tab-pane>
            <el-tab-pane label="音频素材">
              TODO
            </el-tab-pane>
            <el-tab-pane label="视频素材">
              TODO
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-tab-pane>
      <el-tab-pane label="消息事件" name="key">
        <div class="admin-page">
          <div class="mb-main">
            <el-button type="primary" :disabled="config_data.length >= 3" @click="addItem(-1)">新增key</el-button>
          </div>
          <el-table :data="config_data" border>

          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
 
<script>
module.exports = {
  name: 'wechat-open-config',
  components: {
    'common-table': 'url:/admin/components/common/common-table.vue',
    'common-upload': 'url:/admin/components/common/common-upload.vue',
  },
  data: () => ({
    tab_active: 'menu',
    config_data: [],
    type_list: [
      { value: 'view', label: '网页类型', },
      { value: 'click', label: '点击类型', },
      { value: 'miniprogram', label: '小程序类型', }
    ],
    page_info: {
      page_num: 1,
      limit: 10,
      total: 0
    },
    table_data: [],
    props: [
      { label: '图片', key: 'image', min_width: 200, slot_name: 'image', },
      { label: '名称', key: 'name', min_width: 200, },
      { label: '素材id', key: 'size', min_width: 160, },
      { label: '更新时间', key: 'update_time', min_width: 160, filter: 'formateTime' },
    ],
  }),
  mounted() {
    this.getWechatOpenConfig()
    this.pageChange({ page_num: 1, limit: this.page_info.limit })
  },
  methods: {
    // 获取设置
    getWechatOpenConfig() {
      return lc.read('AGConfig', (q) => {
        q.equalTo('type', 'wechat_open_config')
        q.limit(1)
      })
        .then(([res]) => {
          if (!res) throw '配置获取失败'
          this.item_id = res.id
          let config_data = res.get('config_data')
          return config_data
        })
        .then((res) => {
          this.config_data = res.button
        })
        .catch(err => {
          throw err
        })
    },
    // 编辑菜单项
    editItem({ index, sub_index, key } = {}) {
      if (key === 'sort') {
        if (sub_index === -1) {
          this.config_data.sort((a, b) => {
            return (+a[key]) - (+b[key])
          })
        } else {
          this.config_data[index].sub_button.sort((a, b) => {
            return (+a[key]) - (+b[key])
          })
        }
      }
      let lc_object = lc.createObject('AGConfig', this.item_id)
      let data = {
        button: this.config_data
      }
      lc_object.set(`config_data`, data)
      lc_object.save()
        .then(() => {
          this.$toast('更改成功,刷新后查看变更')
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
        })
    },
    addItem(index) {
      // 新增子菜单
      let empty_data = {
        name: '',
        type: '',
        url: '',
        key: '',
        pagepath: '',
        appid: '',
      }
      if (index === -1) {
        this.config_data.push(empty_data)
      } else {
        let reset_key_list = ['type', 'url', 'key', 'pagepath', 'appid',]
        let point_item = this.config_data[index]
        for (let key of reset_key_list) {
          point_item[key] = ''
        }
        if (!point_item.sub_button) {
          point_item.sub_button = [empty_data]
        } else {
          point_item.sub_button.push(empty_data)
        }
        console.log(point_item)
        this.$set(this.config_data, index, point_item)
      }
      this.editItem()
    },
    deleteItem({ index, sub_index }) {
      this.$confirm('确认删除？')
        .then(() => {
          if (sub_index === -1) {
            this.config_data.splice(index, 1)
          } else {
            this.config_data[index].sub_button.splice(sub_index, 1,)
            if (!this.config_data[index].sub_button.length) delete this.config_data[index].sub_button
          }
          this.editItem()
        })
    },
    saveMenu() {
      // 保存菜单
      let data = this.removeEmptyStringValues({ button: this.config_data })
      lc.run('wxSetMenu', { data })
        .then(res => {
          console.log(res)
          this.$toast('更改成功')
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
        })
    },
    removeEmptyStringValues(obj) {
      if (Array.isArray(obj)) {
        // 处理数组
        return obj.map(item => this.removeEmptyStringValues(item))
      }

      if (typeof obj === 'object' && obj !== null) {
        // 处理对象
        const result = {}
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const value = this.removeEmptyStringValues(obj[key])
            if (value !== "" && (Array.isArray(value) || Object.keys(value).length > 0)) {
              result[key] = value
            }
          }
        }
        return result
      }
      return obj
    },
    pageChange({ page_num = 1, limit = 10 } = {}) {
      this.page_info.page_num = page_num
      this.page_info.limit = limit
      lc.run('wxGetMaterial', {
        data: {
          type: "image",
          offset: 0,
          count: limit
        }
      })
        .then(res => {
         console.log(res)
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
        })
    },
  }
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