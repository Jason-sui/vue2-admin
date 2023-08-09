<template>
  <div class="table-box">
    <div class="only-table">
      <el-table class="class-table" ref="common_table" stripe :border="true" :height="height" :data="data"
        :row-key="row_key" v-bind="$attrs" v-on="$listeners" @select="handleSelectChange"
        @select-all="handleSelectChangeAll" :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
        <el-table-column v-if="multiple_option && multiple_option.status" type="selection" width="55">
        </el-table-column>
        <template v-for="(prop, index) in props">
          <el-table-column :key="index" :prop="prop.prop || prop.key" :label="prop.label" :sortable="prop.sortable"
            :width="prop.width" :min-width="prop.min_width" :align="prop.align || 'center'" :fixed="prop.fixed"
            :type="prop.expand?'expand':''">
            <template v-if="prop.label_tooltip">
              <template slot="header">
                <span class="flex aic jcc">
                  <span class="mr-half">
                    {{ prop.label }}
                  </span>
                  <el-tooltip :content="prop.label_tooltip" placement="bottom-start">
                    <span style="display:flex;align-items:center">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M8 1.25C11.7266 1.25 14.75 4.27344 14.75 8C14.75 11.7266 11.7266 14.75 8 14.75C4.27344 14.75 1.25 11.7266 1.25 8C1.25 4.27344 4.27344 1.25 8 1.25ZM8 0.125C3.65469 0.125 0.125 3.65469 0.125 8C0.125 12.3453 3.65469 15.875 8 15.875C12.3453 15.875 15.875 12.3453 15.875 8C15.875 3.65469 12.3453 0.125 8 0.125ZM8.5625 12.5H7.4375V11.375H8.5625V12.5ZM8.75938 8.92812L8.66094 9.0125C8.60469 9.05469 8.5625 9.15313 8.5625 9.2375V10.2641H7.4375V9.2375C7.4375 8.80156 7.63438 8.39375 7.95781 8.12656L8.05625 8.04219C9.04063 7.25469 9.51875 6.84687 9.51875 6.14375C9.51875 5.3 8.84375 4.625 8 4.625C7.12813 4.625 6.48125 5.27187 6.48125 6.14375H5.35625C5.35625 4.66719 6.52344 3.5 8 3.5C9.4625 3.5 10.6438 4.68125 10.6438 6.14375C10.6438 7.42344 9.77188 8.12656 8.75938 8.92812Z"
                          fill="#999999" fill-opacity="0.5" />
                      </svg>
                    </span>
                  </el-tooltip>
                </span>
              </template>
            </template>
            <template v-if="prop.key" slot-scope="scope">
              <slot v-if="prop.slot_name" :name="prop.slot_name" :row="scope.row" :index="scope.$index"></slot>
              <template v-else-if="prop.edit_type">
                <common-edit :row="scope.row" :prop="prop"
                  @edit-item="({value,key,id})=>editItem({value,key,id,index:scope.$index,row:scope.row})" />
              </template>
              <template v-else>
                <template v-if="prop.copytext">
                  <el-tooltip class="item" effect="dark" placement="top">
                    <div slot="content" style="white-space: pre-line !important;max-height:60vh;overflow-y: scroll;">
                      {{ scope.row[prop.key] | filterValue(prop.filter, prop.filterParams && prop.filterParams.map(i => (i.key && scope.row[i.key]) || i))  }}
                    </div>
                    <div class="text-overflow3" v-copy-text style="max-width: 100%;">
                      {{ scope.row[prop.key] | filterValue(prop.filter, prop.filterParams && prop.filterParams.map(i => (i.key && scope.row[i.key]) || i))  }}
                    </div>
                  </el-tooltip>
                </template>
                <template v-else>
                  {{ scope.row[prop.key] | filterValue(prop.filter, prop.filterParams && prop.filterParams.map(i => (i.key &&
                  scope.row[i.key]) || i))  }}
                </template>
              </template>
            </template>
          </el-table-column>
        </template>
        <slot></slot>
      </el-table>
    </div>
    <div v-if="!all_page && page_info.total" class="only-pagination">
      <common-pagination :page_info="page_info" :page_config="page_config" @page-change="pageChange" />
    </div>
  </div>
</template>
<script>
let vm
export default {
  components: {
    'common-pagination': () => importHtmlVue('./common-pagination.vue'),
    'common-edit': () => importHtmlVue('./common-edit.vue'),
  },
  filters: {
    /* 过滤器方法,默认返回指定的值和空字符串 */
    /* 传入filter方法名且有指定的方法存在时调用方法将参数传入,第一个参数固定为val */
    filterValue(val, fun, filterParams = []) {
      if (fun && vm[fun]) {
        return vm[fun](val, ...filterParams)
      }
      return val || vm.empty_val
    },
  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    props: {
      type: Array,
      default: () => [],
    },
    page_info: {
      type: Object,
      default: () => ({}),
    },
    page_config: {
      type: Object,
      default: () => ({}),
    },
    selection: {
      type: Boolean,
      default: () => false
    },
    all_page: {
      type: Boolean,
      default: () => false,
    },
    empty_val: {
      type: String,
      default: () => '--'
    },
    height: {
      type: String,
      default: '100%',
    },
    row_key: {
      type: String,
      default: () => 'objectId'
    },
    multiple_option: {
      type: Object,
      default: () => ({})
    },
  },
  data() {
    vm = this
    return {
      selected_keys: new Set(), // 所有选中的行的 key 集合
      selected_list: [], // 所有选中的行的所有数据集合
      delete_keys: new Set(), // 排除掉的行的 key
    }
  },
  computed: {
    expandData() {
      return util.expandList(this.data)
    }
  },
  watch: {
    data(val) {
      this.$nextTick(() => {
        let seleced_rows = []
        if (this.multiple_option.keep_alive && !this.multiple_option.auto_set) {
          seleced_rows = this.data.filter(i => this.selected_keys.has(i[this.multiple_option.key]))
        } else if (this.multiple_option.auto_set) {
          if (this.multiple_option.keep_alive) {
            seleced_rows = this.data.filter(i => i[this.multiple_option.autoKey] === this.multiple_option.autoValue && !this.delete_keys.has(i[this.multiple_option.key]))
          } else {
            seleced_rows = this.data.filter(i => this.selected_keys.has(i[this.multiple_option.key || 'objectId']))
          }
        }
        this.toggleSelection(seleced_rows)
        this.$refs.common_table.doLayout()
      })
    },
    props: {
      handler() {
        setTimeout(() => {
          this.$refs.common_table.doLayout()
        })
      },
      deep: true
    },
    multiple_option: {
      handler() {
        this.$nextTick(() => {
          let seleced_rows = []
          if (this.multiple_option.auto_set) {
            if (this.multiple_option.keep_alive) {
              seleced_rows = this.data.filter(i => i[this.multiple_option.autoKey] === this.multiple_option.autoValue && !this.delete_keys.has(i[this.multiple_option.key]))
            } else {
              this.selected_keys = new Set(this.multiple_option.select_list.map(i => i[this.multiple_option.key || 'objectId']))
              seleced_rows = this.data.filter(i => this.selected_keys.has(i[this.multiple_option.key || 'objectId']))
            }
          }
          this.toggleSelection(seleced_rows)
          this.$refs.common_table.doLayout()
        })
      },
      deep: true,
      immediate: true,
    }
  },
  methods: {
    pageChange(obj) {
      this.$emit('page-change', obj)
    },
    // 单选
    handleSelectChange(val) {
      let idList = val.map(i => i[this.multiple_option.key || 'objectId'])
      for (let item of this.data) {
        let id_list_have = idList.includes(item[this.multiple_option.key || 'objectId'])
        let select_have = this.selected_keys.has(item[this.multiple_option.key || 'objectId'])
        if (id_list_have && !select_have) { //
          this.selected_keys.add(item[this.multiple_option.key || 'objectId'])
          this.selected_list.push(item)
          this.delete_keys.delete(item[this.multiple_option.key || 'objectId'])
        } else if (!id_list_have && select_have) {
          this.selected_keys.delete(item[this.multiple_option.key || 'objectId'])
          let idx = this.selected_list.findIndex(i => i === item[this.multiple_option.key || 'objectId'])
          this.selected_list.splice(idx, 1)
          this.delete_keys.add(item[this.multiple_option.key || 'objectId'])
        }
      }
      if (this.multiple_option.select_change === 'key') {
        this.$emit('selection-change', this.selected_keys)
      } else {
        this.$emit('selection-change', this.selected_list)
      }
    },
    // 全选
    handleSelectChangeAll(val) {
      if (val.length) {
        for (let item of this.data) {
          if (!this.selected_keys.has(item[this.multiple_option.key || 'objectId'])) {
            this.selected_keys.add(item[this.multiple_option.key || 'objectId'])
            this.selected_list.push(item)
            this.delete_keys.delete(item[this.multiple_option.key || 'objectId'])
          }
        }
      } else {
        for (let item of this.data) {
          if (this.selected_keys.has(item[this.multiple_option.key || 'objectId'])) {
            this.selected_keys.delete(item[this.multiple_option.key || 'objectId'])
            let idx = this.selected_list.findIndex(i => i === item[this.multiple_option.key || 'objectId'])
            this.selected_list.splice(idx, 1)
            this.delete_keys.add(item[this.multiple_option.key || 'objectId'])
          }
        }
      }
      if (this.multiple_option.select_change === 'key') {
        this.$emit('selection-change', this.selected_keys)
      } else {
        this.$emit('selection-change', this.selected_list)
      }
    },
    // 设置选中 会触发change事件
    toggleSelection(rows) {
      if (rows && rows.length) {
        rows.forEach((row) => {
          this.$refs.common_table.toggleRowSelection(row, true)
        })
      } else {
        this.$refs.common_table.clearSelection()
      }
    },
    // 重置选中的内容
    selectRest() {
      this.selected_keys = []
      this.selected_list = []
      if (this.multiple_option.select_change === 'key') {
        this.$emit('selection-change', this.selected_keys)
      } else {
        this.$emit('selection-change', this.selected_list)
      }
    },
    // 删除一个数据，通过 multiple_option.condition_key 对应的值
    deleteSelectInValue(val) {
      let idx = this.selected_keys.findIndex(i => i === val)
      if (idx > -1) {
        this.selected_keys.delete(item[this.multiple_option.key || 'objectId'])
        this.selected_list.splice(idx, 1)
        if (this.multiple_option.select_change === 'key') {
          this.$emit('selection-change', this.selected_keys)
        } else {
          this.$emit('selection-change', this.selected_list)
        }
      }
    },
    editItem({ key = '', index = '', value = '', id = '', row }) {
      let item = this.expandData.find(i => i[this.row_key] === id)
      let edit_value = value || item[key] || this.data[index][key]
      this.$emit('edit-item', { value: edit_value, key, index, id, row })
    },
    getRelation({ row = {}, index = 0, query = '', key = '', object_class = '', query_key = 'name' } = {}) {
      if (!row) return
      row.loading = true
      lc.readTotal(object_class, (q) => {
        q.contains(query_key, query)
      })
        .then(res => {
          let { data, count } = res
          row[`${key}_list`] = data.map(i => i.toJSON())
          row.loading = false
        })
        .catch(err => {
          console.log(err)
          this.$alert(err)
          row.loading = false
        })
    },
    changeRelation({ index = 0, value, key = '', object_class = '' } = {}) {
      let lc_object = lc.createObject(object_class, value)
      this.editItem({ value: lc_object, key, index })
    },
    // filter方法
    formateTime(val, format = 'YYYY/MM/DD HH:mm') {
      return dayjs(val).format(format)
    },
    formateStringNumberTime(val, format = 'YYYY/MM/DD HH:mm') {
      return dayjs(+val).format(format)
    },
    formateListLabel(val, list, value_key = 'value', label_key = 'label') {
      if (!list.length) return val
      let item = list.find(i => i[value_key] === val)
      if (item) return item[label_key]
      return val
    },
    formatObject(val) {
      return JSON.stringify(val || {}, null, 2)
    }
  },
}
</script>
<style scoped>
.table-box {
  display: flex;
  flex: 1;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}

.only-table {
  overflow: hidden;
  flex: 1;
  box-sizing: border-box;
}

.only-pagination {
  text-align: right;
}
</style>
