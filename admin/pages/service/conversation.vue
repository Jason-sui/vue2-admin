<template>
  <div class="admin-page">
    <common-form :data_list="search_list" :form_data.sync="search_form" :select_data="select_data"
      @submit-form="pageChange({ pageNum: 1, limit: page_info.limit })"></common-form>
    <div class="flex mb-main">
      <el-button type="primary" @click.stop="addItem">新增</el-button>
    </div>
    <common-table :data="table_data" :props="props" :page_info="page_info" @page-change="pageChange"
      @edit-item="({ value, key, index }) => editItem({ type: '', value, key, index })">
      <template #result_list="{row,index}">
        <div class="flex-c" style="height: 300px;">
          <div class="flex mb-half">
            <el-button type="primary" @click="addUserMap({row})">新增通知用户</el-button>
          </div>
          <common-table v-if="row.result_list && row.result_list.length" :data="row.result_list"
            :props="result_list_props" border>
            <el-table-column label="操作" min-width="50" align="center">
              <div slot-scope="scope">
                <el-button size="mini" type="text" @click.stop="deleteUserMap({ row:scope.row})">删除
                </el-button>
              </div>
            </el-table-column>
          </common-table>
        </div>
      </template>
      <el-table-column label="操作" :min-width="120" align="center">
        <div slot-scope="{ row,$index }">
          <el-button size="mini" type="text" @click.stop="deleteItem({ row,index: $index })">删除</el-button>
        </div>
      </el-table-column>
    </common-table>
  </div>
</template>
 
<script>
module.exports = {
  name: 'conversation',
  components: {
    'common-table': 'url:/admin/components/common/common-table.vue',
    'common-form': 'url:/admin/components/common/common-form.vue',
  },
  data: () => ({
    props: [
      { label: '名称', key: 'name', edit_type: 'input' },
      { label: '是否禁用', label_tooltip: '禁用状态优先于截止时间', key: 'disable', edit_type: 'boolean' },
      { label: '截止时间', label_tooltip: '禁用状态优先于截止时间', min_width: 240, key: 'end_time', edit_type: 'day2number' },
      { label: '消息', label_tooltip: '消息用户只能读取一次,读取之前修改', key: 'message', width: 300, edit_type: 'textarea' },
      { label: '消息详情', key: 'result_list', width: 300, expand: true, slot_name: 'result_list' },
    ],
    table_data: [],
    page_info: {
      page_num: 1,
      limit: 10,
      total: 0
    },
    search_list: [
      { label: '名称', key: 'name', type: 'input' },
      { label: '消息', key: 'message', type: 'input' },
    ],
    search_form: {
      name: '',
      message: ''
    },
    select_data: {
      // 选择用的数据
    },
    query_data: {
      name: 'contains',
      message: 'contains',
    },
    class_name: 'KSConversation',
    result_list_props: [
      { label: '用户', key: 'user', user_slot: true },
      { label: '是否已读', key: 'readed', edit_type: 'boolean', edit_disabled: true },
    ],
    empty_item: {
      // 默认新增的item信息
      disable: true
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
        q.include(['result_list', 'user_list'])
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
            item.result_list.map(i => {
              i.user = item.user_list.find(user => user.objectId === i.user.objectId)
              return i
            })
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
            // 唯一值key列表
            only_key_list: []
          }
          if (copy_data && copy_data.objectId) {
            request = lc.run('copyClassData', {
              ...class_data,
              id: copy_data.objectId
            })
          } else {
            // 新增的默认数据
            request = lc.create(class_data.class_name, { ...this.empty_item, end_time: new Date().getTime() })
          }
          request
            .then((res) => {
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
              let promise = Promise.resolve()
              if (row.result_list.length) {
                let request_list = result_list.map((result) => {
                  let lc_object = lc.createObject('KSConversationUserResult', result.objectId)
                  return lc_object.destroy()
                })
                promise = Promise.all(request_list)
              }
              promise
                .then(() => {
                  return lc.delete(this.class_name, row.objectId)
                })
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
    addUserMap({ row }) {
      this.$prompt('请输入用户id,使用逗号分格,', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(async ({ value }) => {
        let user_list = value.split(',')
        let conversation = lc.createObject(this.class_name, row.objectId)
        for (let user_id of user_list) {
          let user = lc.createObject('_User', user_id)
          let ret = await lc.create('KSConversationUserResult', {
            user,
            conversation
          })
          conversation.add('result_list', ret)
          conversation.add('user_list', user)
        }
        return conversation.save()
      })
        .then(res => {
          this.pageChange(this.page_info)
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
        })
    },
    deleteUserMap({ row }) {
      let user_map = lc.createObject('KSConversationUserResult', row.objectId)
      let user = lc.createObject('_User', row.user.objectId)
      let conversation = lc.createObject(this.class_name, row.conversation.objectId)
      conversation.remove('result_list', user_map)
      conversation.remove('user_list', user)
        .save()
        .then(() => {
          return user_map.destroy()
        })
        .then(() => {
          this.pageChange(this.page_info)
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