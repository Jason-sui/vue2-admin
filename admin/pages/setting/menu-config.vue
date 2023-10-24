<template>
  <div class="admin-page">
    <common-form :data_list="search_list" :form_data.sync="search_form" :select_data="select_data"
      @submit-form="pageChange({ pageNum: 1, limit: page_info.limit })"></common-form>
    <div class="flex mb-main">
      <el-button type="primary" @click.stop="addItem">新增</el-button>
    </div>
    <common-table :data="table_data" :props="props" :page_info="page_info" @page-change="pageChange"
      @edit-item="({ value, key, index,row ,id}) => editItem({ type: '',row, value, key, index,id})"
      :tree-props="{children: 'children'}">
      <template #start>
        <el-table-column label="子级" width="80" align="center">
          <template slot-scope="scope">{{scope.row.children.length?'---':'-'}}</template>
        </el-table-column>
      </template>
      <template #parent="{row,index}">
        <el-select v-model="row.parent.objectId" :disabled="row.children.length"
          @change="editItem({ row, value: row.parent.objectId, key: 'parent', index,id:row.objectId  })">
          <el-option v-for="item in parent_list" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </template>
      <template #permission_list="{ row, index }">
        <el-tooltip class="item" effect="dark" placement="top">
          <div slot="content" style="white-space: pre-line">
            {{row.permission_list.length?row.permission_list.map(i=>`${i.name}`).join('\n\n'):'权限配置'}}
          </div>
          <el-button size="mini" type="text" @click.stop="openPermissionSetting({  row,index })">
            {{row.permission_list.length?row.permission_list.map(i=>`${i.name}`).join(','):'权限配置'}}
          </el-button>
        </el-tooltip>
      </template>
      <el-table-column label="操作" :width="160" align="center" fixed="right">
        <div slot-scope="{ row,$index }">
          <el-button v-if="!row.parent.objectId" size="mini" type="text"
            @click.stop="addChildrenItem({ row })">新增子级</el-button>
          <el-button size="mini" type="text" @click.stop="addItem({ copy_data: row })">复制</el-button>
          <el-button size="mini" type="text"
            @click.stop="deleteItem({ row,index: $index ,id:row.objectId})">删除</el-button>
        </div>
      </el-table-column>
    </common-table>
    <common-dialog :visible.sync="dialog" height="60vh" :append_to_body="true" :show_footer="false">
      <div class="flex mb-main">
        <el-button type="primary" @click.stop="addItem({type:'permission'})">新增</el-button>
      </div>
      <common-table :data="permission_data" :props="permission_props"
        @edit-item="({ value, key, index, row,id}) => editItem({ type: 'permission', row, value, key, index, id})">
        <template #roles="{row,index}">
          <common-edit :row="row" :prop="permission_prop"
            @edit-item="({value,key,id})=>editItem({ type: 'permission', row, value, key, index, id})" />
        </template>
        <el-table-column label="操作" :min-width="160" align="center" fixed="right">
          <div slot-scope="{ row,$index }">
            <el-button size="mini" type="text"
              @click.stop="deleteItem({ type:'permission',row, index: $index, id:row.objectId})">删除</el-button>
          </div>
        </el-table-column>
      </common-table>
    </common-dialog>
  </div>
</template>
 
<script>
let role_list = []
module.exports = {
  name: 'admin-config',
  components: {
    'common-table': 'url:/admin/components/common/common-table.vue',
    'common-form': 'url:/admin/components/common/common-form.vue',
    'common-edit': 'url:/admin/components/common/common-edit.vue',
    'common-dialog': 'url:/admin/components/common/common-dialog.vue',
  },
  data: () => ({
    dialog: false,
    props: [
      { label: '排序', key: 'sort', width: 100, edit_type: 'number' },
      { label: '父级', key: 'parent', min_width: 160, slot_name: 'parent' },
      { label: '图标', key: 'icon', min_width: 160, edit_type: 'select', select_icon: true, select_list: admin_mock_data.select_data.element_icon },
      { label: '标题', key: 'title', min_width: 160, edit_type: 'input' },
      { label: '名称', label_tooltip: '蛇形命名,需要唯一值,必填', key: 'name', min_width: 160, edit_type: 'input' },
      { label: '路径', label_tooltip: '文件路径,设置了子级路径失效,没有子级且不设置也不生效', key: 'page_path', min_width: 160, edit_type: 'input' },
      { label: '权限配置', label_tooltip: '配置页面的权限,例如页面权限,页面操作权限,配置后在角色管理处配置对应的角色拥有的权限', key: 'permission_list', min_width: 300, slot_name: 'permission_list' },
    ],
    table_data: [],
    permission_data: [

    ],
    permission_props: [
      { label: '类型', label_tooltip: '默认功能权限,配置了页面权限后,配置了页面权限后没有相应权限的非超级管理员将无法看到对应的页面', key: 'type', min_width: 160, edit_type: 'select', select_list: admin_mock_data.select_data.permission_type },
      { label: 'key', label_tooltip: '蛇形命名,需要唯一值,必填,权限的key,配置页面权限时,只勾选子级不生效', key: 'key', min_width: 160, edit_type: 'input' },
      { label: '名称', label_tooltip: '权限显示的名称', key: 'name', min_width: 160, edit_type: 'input' },
      { label: '权限绑定的角色', label_tooltip: '页面权限设置之后不启用就只有超级管理员能使用,功能权限需要配置之后单独开发', key: 'roles', min_width: 300, slot_name: 'roles' },
    ],
    page_info: {
      page_num: 1,
      limit: 10,
      total: 0
    },
    search_list: [
      { label: '名称', key: 'name', type: 'input' },
      { label: '标题', key: 'title', type: 'input' },
      { label: '路径', key: 'path', type: 'input' },
    ],
    search_form: {
      name: '',
      title: '',
      path: ''
    },
    select_data: {
      // 选择用的数据
    },
    query_data: {
      title: 'contains',
      name: 'contains',
      path: 'contains'
    },
    class_name: 'KSAdminRoute',
    current_item: null,
    empty_item: {
      // 默认新增的item信息
      sort: 0,
      icon: 'el-icon-s-operation',
      title: '标题'
    },
    permission_prop: {
      key: 'roles',
      edit_type: 'select',
      select_multiple: true,
      select_list: []
    },
    parent_lc_list: [],
    parent_list: []
  }),
  created() {
    this.pageChange(this.page_info)
    this.getParent()
    this.getRoleList()
  },
  methods: {
    getRoleList() {
      lc.read('_Role', (q) => {
        q.notEqualTo('objectId', '63a9aeb28d766d5be9654bbd')
        q.ascending('sort')
        q.addDescending('createdAt')
      })
        .then(res => {
          this.permission_prop.select_list = res.map(i => {
            let item = i.toJSON()
            return {
              label: item.name,
              value: item.name,
            }
          })
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
        })
    },
    getParent() {
      return lc.read(this.class_name, q => {
        q.doesNotExist('parent')
        q.include(['children', 'parent'])
        q.ascending('sort')
        q.addDescending('createdAt')
      })
        .then(res => {
          this.parent_lc_list = res.map(i => i.toJSON())
          this.parent_list = [{ label: '首页', value: '' }, ...this.parent_lc_list.map(i => ({ label: i.title, value: i.objectId }))]
        })
        .catch(err => {
          console.log(err)
        })
    },
    pageChange({ page_num = 1, limit = 10 } = {}, class_name = this.class_name) {
      if (!class_name) return
      this.page_info.page_num = page_num
      this.page_info.limit = limit
      this.$loading()
      return lc.readTotal(class_name, (q) => {
        q = this.$setQuery(q, this.search_form, this.query_data)
        q.doesNotExist('parent')
        q.limit(limit)
        q.skip(limit * (page_num - 1))
        q.include(['children', 'parent', 'permission_list'])
        q.ascending('sort')
        q.addDescending('createdAt')
      })
        .then(res => {
          let { data, count } = res
          this.page_info.total = count
          this.table_data = data.map(i => {
            let item = i.toJSON()
            // 处理数据
            item.children = item.children.filter(i => i).map(i => ({
              ...i,
              current_parent_id: i.parent.objectId
            }))
            item.parent = {
              objectId: '',
              current_parent_id: ''
            }
            return item
          })
          return Promise.resolve()
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
        })
        .finally(() => {
          setTimeout(() => {
            this.$loading().close()
          }, 50)
        })
    },
    addItem({ type, copy_data }) {
      let request
      let class_data = {}
      this.empty_item.name = `name${new Date().getTime()}`
      switch (type) {
        case 'permission':
          let route = lc.createObject(this.class_name, this.current_item.objectId)
          class_data = {
            class_name: 'KSAdminPermission',
            only_key_list: ['key']
          }
          if (copy_data && copy_data.objectId) {
            request = lc.run('copyClassData', {
              ...class_data,
              id: copy_data.objectId
            })
          } else {
            // 新增的默认数据
            request = lc.create(class_data.class_name, {
              key: new Date().getTime() + '',
              name: '权限1',
              type: 'func',
              route,
            })
          }
          request
            .then((res) => {
              // 指定元素增加权限
              this.editItem({ key: 'permission_list', value: [...this.current_item.permission_list, res.toJSON()], row: this.current_item, id: this.current_item.objectId })
            })
            .catch(err => {
              console.log(err)
              this.$alert(err)
            })
          break
        default:
          class_data = {
            class_name: this.class_name,
            only_key_list: ['name']
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
    editItem({ type, row, key, index, value, id }, page_change = true) {
      let set_value = value
      switch (type) {
        case 'permission':
          return lc.update('KSAdminPermission', id, { [key]: value })
            .then(res => {
              this.$toast('更改成功')
            })
            .catch(err => {
              console.log(err)
              this.$alert(err)
              throw Error
            })
        default:
          switch (key) {
            case 'children':
              value.sort((a, b) => {
                return (+a.sort) - (+b.sort)
              })
              value = value.map(i => lc.createObject(this.class_name, i.objectId))
              break
            case 'permission_list':
              value = value.map(i => lc.createObject('KSAdminPermission', i.objectId))
              break
            case 'parent':
              if (value) {
                value = lc.createObject(this.class_name, value)
              }
              else value = undefined
              break
            default:
              break
          }
          let request = lc.update(this.class_name, id || this.table_data[index].objectId, { [key]: value })
          if (!value) {
            let lc_object = lc.createObject(this.class_name, id || this.table_data[index].objectId)
            lc_object.unset(key)
            request = lc_object.save()
          }
          return request
            .then(res => {
              switch (key) {
                case 'permission_list':
                  this.pageChange(this.page_info)
                    .then(() => {
                      this.current_item = this.table_data.find(i => i.objectId === this.current_item.objectId)
                      this.permission_data = this.current_item.permission_list
                    })
                  break
                case 'sort':
                  if (row.parent.objectId) {
                    let parent_item = this.table_data.find(i => i.objectId === row.parent.objectId)
                    this.editItem({ row: row.parent, key: 'children', value: parent_item.children, id: parent_item.objectId })
                  } else {
                    if (page_change) {
                      this.pageChange(this.page_info)
                      this.$toast('更改成功,刷新后查看变更')
                    }
                  }
                  break
                case 'parent':
                  let promise_list = []
                  if (set_value) {
                    // 新增目标的
                    let parent = this.parent_lc_list.find(i => i.objectId === set_value)
                    console.log(parent)
                    let lc_parent = lc.createObject(this.class_name, parent.objectId)
                    lc_parent.add('children', res)
                    promise_list.push(lc_parent.save())
                  }
                  // 删除之前的item
                  if (row.current_parent_id) {
                    let delete_parent = this.parent_lc_list.find(i => i.objectId === row.current_parent_id)
                    let lc_delete_parent = lc.createObject(this.class_name, delete_parent.objectId)
                    lc_delete_parent.remove('children', res)
                    promise_list.push(lc_delete_parent.save())
                  }
                  promise_list.push()
                  Promise.all(promise_list)
                    .then(() => {
                      return this.getParent()
                    })
                    .then(res => {
                      this.pageChange(this.page_info)
                      this.$toast('更改成功,刷新后查看变更')
                    })
                    .catch(err => {
                      console.log(err)
                    })
                  break
                default:
                  if (page_change) {
                    this.pageChange(this.page_info)
                    this.$toast('更改成功,刷新后查看变更')
                  }
                  break
              }
              return Promise.resolve()
            })
            .catch(err => {
              console.log(err)
              this.$alert(err)
              throw Error
            })
      }
    },
    deleteItem({ type, row, index, id }) {
      this.$confirm('确认删除？')
        .then(() => {
          switch (type) {
            case 'permission':
              lc.delete('KSAdminPermission', id || row.objectId)
                .then(() => {
                  // 指定元素删除权限
                  this.editItem({ key: 'permission_list', value: this.current_item.permission_list.filter(i => i.objectId !== id), row: this.current_item, id: this.current_item.objectId })
                })
              break
            default:
              lc.delete(this.class_name, id || row.objectId)
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
    addChildrenItem({ row }) {
      console.log(lc.createObject(this.class_name, row.objectId))
      this.empty_item.name = `name${new Date().getTime()}`
      lc.create(this.class_name, { ...this.empty_item, parent: lc.createObject(this.class_name, row.objectId) })
        .then(res => {
          this.editItem({ key: 'children', value: [...row.children, res.toJSON()], id: row.objectId })
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
        })
    },
    openPermissionSetting({ row }) {
      this.current_item = row
      this.permission_data = this.current_item.permission_list
      this.dialog = true
    }
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