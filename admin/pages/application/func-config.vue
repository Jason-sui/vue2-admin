<template>
  <div class="admin-page">
    <el-tabs v-model="tab_active">
      <el-tab-pane label="应用积分设置" name="func_config">
        <div class="admin-page">
          <el-form ref="ruleForm" :inline="true" :model="form" hide-required-asterisk>
            <el-form-item prop="name" label="方法名">
              <el-input v-model="form.name" placeholder="方法名" maxlength="11" clearable
                @keyup.enter.native="pageChange({ page_num: 1, limit: page_info.limit })"></el-input>
            </el-form-item>
            <el-form-item prop="key" label="方法key">
              <el-input v-model="form.key" placeholder="方法key" maxlength="11" clearable
                @keyup.enter.native="pageChange({ page_num: 1, limit: page_info.limit })"></el-input>
            </el-form-item>
            <el-form-item prop="type" label="类型">
              <el-select v-model="form.type" clearable @change="pageChange({ page_num: 1, limit: page_info.limit })">
                <el-option v-for="item in type_list" :key="item.value" :label="item.label"
                  :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="title" label="应用名">
              <el-input v-model="form.title" placeholder="应用名" maxlength="11" clearable
                @keyup.enter.native="pageChange({ page_num: 1, limit: page_info.limit })"></el-input>
            </el-form-item>
            <el-form-item prop="remind" label="备注">
              <el-input v-model="form.remind" placeholder="备注" maxlength="11" clearable
                @keyup.enter.native="pageChange({ page_num: 1, limit: page_info.limit })"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="pageChange({ page_num: 1, limit: page_info.limit })">查询</el-button>
              <el-button @click="formClear">清空</el-button>
            </el-form-item>
          </el-form>
          <div class="mb-main">
            <el-button type="primary" @click="addItem">新增方法</el-button>
          </div>
          <common-table :data="table_data" :props="props" :page_info="page_info" @page-change="pageChange">
            <template #name="{ row, index }">
              <el-input v-model="row.name" @keyup.enter.native="editItem({ row, key: 'name' })"></el-input>
            </template>
            <template #remind="{ row, index }">
              <el-input v-model="row.remind" @keyup.enter.native="editItem({ row, key: 'remind' })"></el-input>
            </template>
            <template #type="{ row, index }">
              <el-select v-model="row.type" @change="editItem({ row, key: 'type' })">
                <el-option v-for="item in type_list" :key="item.value" :label="item.label"
                  :value="item.value"></el-option>
              </el-select>
            </template>
            <template #title="{ row, index }">
              <el-input v-model="row.title" @keyup.enter.native="editItem({ row, key: 'title' })"></el-input>
            </template>
            <template #key="{ row, index }">
              <el-input v-model="row.key" @keyup.enter.native="editItem({ row, key: 'key' })"></el-input>
            </template>
            <template #integration="{ row, index }">
              <el-input v-model.number="row.integration"
                @keyup.enter.native="editItem({ row, key: 'integration' })"></el-input>
            </template>
            <template #icon="{ row, index }">
              <common-upload :url.sync="row.icon" @change="editItem({ row, key: 'icon' })"></common-upload>
            </template>
            <template #integration_text="{ row, index }">
              <el-input v-model="row.integration_text"
                @keyup.enter.native="editItem({ row, key: 'integration_text' })"></el-input>
            </template>
            <template #action="{ row, index }">
              <el-select v-model="row.action_id" remote filterable :default-first-option="true"
                :remote-method="(query) => getAction({ row, index, query, type: 'action_list' })" :loading="row.loading"
                @change="(value) => changeAction({ row, value, type: 'action' })">
                <el-option v-for="item in row.action_list" :key="item.objectId" :label="item.name"
                  :value="item.objectId"></el-option>
              </el-select>
            </template>
            <template #error_action="{ row, index }">
              <el-select v-model="row.error_action_id" remote filterable :default-first-option="true"
                :remote-method="(query) => getAction({ row, index, query, type: 'error_action_list' })"
                :loading="row.loading" @change="(value) => changeAction({ row, value, type: 'error_action' })">
                <el-option v-for="item in row.error_action_list" :key="item.objectId" :label="item.name"
                  :value="item.objectId"></el-option>
              </el-select>
            </template>
            <el-table-column label="操作" min-width="160" fixed="right" align="center">
              <div slot-scope="{ row }">
                <el-button size="mini" type="text" @click.stop="copyItem({ row })">复制</el-button>
                <el-button size="mini" type="text" @click.stop="deleteItem(row)">删除</el-button>
              </div>
            </el-table-column>
          </common-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
 
<script>
module.exports = {
  name: 'func-config',
  components: {
    'common-table': 'url:/admin/components/common/common-table.vue',
    'common-upload': 'url:/admin/components/common/common-upload.vue',
  },
  data: () => {
    return {
      tab_active: 'func_config',
      page_info: {
        page_num: 1,
        limit: 10,
        total: 0
      },
      table_data: [],
      props: [
        { label: '方法名', key: 'name', min_width: 160, slot_name: 'name' },
        { label: '方法key', key: 'key', min_width: 160, slot_name: 'key' },
        { label: '类型', key: 'type', min_width: 160, slot_name: 'type' },
        { label: '应用名', key: 'title', min_width: 160, slot_name: 'title' },
        { label: '备注说明', key: 'remind', min_width: 160, slot_name: 'remind' },
        { label: '基础积分消耗', key: 'integration', min_width: 140, slot_name: 'integration', },
        { label: '积分图标', key: 'icon', min_width: 200, slot_name: 'icon', },
        { label: '积分消耗文本', key: 'integration_text', min_width: 140, slot_name: 'integration_text', },
        { label: '积分流水名称', key: 'action', min_width: 140, slot_name: 'action', },
        { label: '失败流水名称', key: 'error_action', min_width: 140, slot_name: 'error_action', },
      ],
      form: {
        name: '',
        key: '',
        remind: ''
      },
      type_list: [{ value: 'write', label: '文字创作' }, { value: 'image', label: '绘画' }, { value: 'music', label: '音乐' }, { value: 'video', label: '视频' }],
      user_config_data: [],
      user_config_props: [],
      user_config_page_info: {
        page_num: 1,
        limit: 10,
        total: 0
      },
    }
  },
  created() {
    this.pageChange({ page_num: 1, limit: this.page_info.limit })
  },
  methods: {
    formClear() {
      this.$refs['ruleForm'].resetFields()
      this.pageChange({ page_num: 1, limit: this.page_info.limit })
    },
    pageChange({ page_num = 1, limit = 10 } = {}) {
      this.page_info.page_num = page_num
      this.page_info.limit = limit
      lc.readTotal('KSFunctionConfig', (q) => {
        for (let key in this.form) {
          if (this.form[key]) {
            q.contains(key, this.form[key])
          }
        }
        q.include('action')
        q.include('error_action')
        q.limit(limit)
        q.skip(limit * (page_num - 1))
        q.ascending('name')
        q.ascending('type')
        q.descending('createdAt')
      })
        .then(res => {
          let { data, count } = res
          this.page_info.total = count
          if (!data.length && this.search_title) throw { rawMessage: '行为名称查询失败' }
          this.table_data = data.map(i => {
            let item = i.toJSON()
            item.action_id = item.action && item.action.objectId
            item.action_list = (item.action && [item.action]) || []
            item.error_action_id = item.error_action && item.error_action.objectId
            item.error_action_list = (item.error_action && [item.error_action]) || []
            return item
          })
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
        })
    },
    addItem() {
      lc.create('KSFunctionConfig', {
        name: '方法名',
        remind: '新方法',
        key: 'common',
        title: '',
        integration: 0,
        icon: 'https://aigeek-1258317412.cos.ap-beijing.myqcloud.com/mobile/icon/icon-integral.png',
        integration_text: '生成文本'
      })
        .then(res => {
          console.log(res)
          this.pageChange({ page_num: 1, limit: this.page_info.limit })
        })
    },
    copyItem({ row }) {
      let {
        name = '方法名',
        remind = '新方法',
        key = 'common',
        title = '',
        type = '',
        integration = 0,
        icon = 'https=//aigeek-1258317412.cos.ap-beijing.myqcloud.com/mobile/icon/icon-integral.png',
        integration_text = ''
      } = row
      let action = lc.createObject('AGAction', row && row.action_id || '64a3a258421716233a1b6405')
      let error_action = lc.createObject('AGAction', row && row.error_action_id || '6449d250bb00a33ddc417885')
      lc.create('KSFunctionConfig', {
        name, type, remind, key, title, integration, icon, integration_text, action, error_action
      })
        .then(res => {
          console.log(res)
          this.pageChange({ page_num: 1, limit: this.page_info.limit })
        })
    },
    editItem({ row, key }) {
      lc.update('KSFunctionConfig', row.objectId, { [key]: row[key] })
        .then(res => {
          this.pageChange(this.page_info)
          this.$toast('更改成功,刷新后查看变更')
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
        })
    },
    deleteItem(row) {
      this.$confirm('确认删除？')
        .then(() => {
          lc.delete('KSFunctionConfig', row.objectId)
            .then(() => {
              this.pageChange(this.page_info)
            })
            .catch(err => {
              console.log(err)
              this.$alert(err)
            })
        })
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
    changeAction({ row, value, type }) {
      row[type] = lc.createObject('AGAction', value)
      this.editItem({ row, key: type })
    }
  },
}
</script>

<style scoped>
.image-item {
  height: 80px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
</style>