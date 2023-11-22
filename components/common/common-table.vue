<template>
  <div class="table-box">
    <div class="only-table">
      <el-table class="class-table" ref="common_table" stripe :border="true" :height="height" :data="data"
        :row-key="row_key" v-bind="$attrs" v-on="$listeners" @select="handleSelectChange"
        @select-all="handleSelectChangeAll" :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
        <slot name="start"></slot>
        <el-table-column v-if="multiple_option && multiple_option.status" type="selection" width="55">
        </el-table-column>
        <template v-for="(prop, index) in props">
          <common-table-column :prop="prop" :key="index" @edit-item="editItem">
            <template v-if="prop.slot_name" slot-scope="scope">
              <slot :name="prop.slot_name" :row="scope.row" :index="scope.index"></slot>
            </template>
          </common-table-column>
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
    'common-table-column': () => importHtmlVue('./common-table-column.vue'),
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
        setTimeout(() => {
          this.$refs.common_table.doLayout()
        })
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
      let edit_value = value 
      this.$emit('edit-item', { value: edit_value, key, index, id, row })
    },
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
